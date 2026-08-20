/**
 * MEDYX — Rescue Search engine
 *
 * Pure, framework-free logic so it can be swapped onto a real API later.
 * The UI never computes distance or confidence itself.
 */

import {
  MEDICINES,
  PHARMACIES,
  STOCK,
  type Medicine,
  type Pharmacy,
  type SavedLocation,
} from '../data/demoData';

/** The four Rescue Search rings, in kilometres. */
export const RADIUS_STEPS = [5, 10, 25, 50] as const;
export type RadiusStep = (typeof RADIUS_STEPS)[number];

export const MAX_RADIUS = RADIUS_STEPS[RADIUS_STEPS.length - 1];

/* -------------------------------------------------------------------------- */
/* Medicine matching                                                           */
/* -------------------------------------------------------------------------- */

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0600-\u06ff\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cheap edit-distance so light misspellings ("amoxicilin", "glargin") still
 * resolve. Stands in for the Gemini AI resolution step.
 */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length || !b.length) return Math.max(a.length, b.length);

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    for (let j = 1; j <= b.length; j += 1) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

export interface MedicineMatch {
  medicine: Medicine;
  /** True when we had to correct a spelling or resolve an alias. */
  interpreted: boolean;
  /** What the user actually typed. */
  rawQuery: string;
}

/** Resolves free text to a medicine. Returns null when nothing is close. */
export function matchMedicine(query: string): MedicineMatch | null {
  const q = normalise(query);
  if (!q) return null;

  let best: { medicine: Medicine; score: number } | null = null;

  for (const medicine of MEDICINES) {
    const candidates = [
      medicine.name,
      medicine.molecule,
      `${medicine.molecule} ${medicine.strength}`,
      ...medicine.aliases,
    ].map(normalise);

    for (const candidate of candidates) {
      let score: number | null = null;

      if (candidate === q) {
        score = 0;
      } else if (candidate.includes(q) || q.includes(candidate)) {
        // Substring hits are strong but not literal. Guard against a very
        // short query matching inside a long name ("in" → "insulin").
        if (q.length >= 4) score = 0.5;
      } else {
        // Compare against the closest single word too, so "glargin insulin"
        // still lands on the right molecule. Tolerance scales with the
        // SHORTER string and is capped, so unrelated words never match.
        const distances = [
          editDistance(q, candidate),
          ...candidate.split(' ').map((word) => editDistance(q, word)),
        ];
        const d = Math.min(...distances);
        const tolerance = Math.max(
          1,
          Math.min(3, Math.floor(Math.min(q.length, candidate.length) * 0.3)),
        );
        if (d <= tolerance) score = d;
      }

      if (score !== null && (!best || score < best.score)) {
        best = { medicine, score };
      }
    }
  }

  if (!best) return null;

  // "Interpreted" means MEDYX had to resolve the input — a brand name, a local
  // name or a misspelling — rather than the user typing the catalogue name.
  const interpreted = normalise(best.medicine.name) !== q;

  return {
    medicine: best.medicine,
    interpreted,
    rawQuery: query.trim(),
  };
}

/** Type-ahead suggestions for the search field. */
export function suggestMedicines(query: string, limit = 5): Medicine[] {
  const q = normalise(query);
  if (!q) return [];
  return MEDICINES.filter((m) =>
    [m.name, m.molecule, ...m.aliases].some((c) => normalise(c).includes(q)),
  ).slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Distance                                                                    */
/* -------------------------------------------------------------------------- */

/** Great-circle distance in kilometres. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/* -------------------------------------------------------------------------- */
/* Freshness + confidence                                                      */
/* -------------------------------------------------------------------------- */

export function formatUpdatedAgo(minutes: number): string {
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${Math.round(minutes)} min ago`;
  const hours = minutes / 60;
  if (hours < 24) {
    const h = Math.floor(hours);
    return h === 1 ? '1 hour ago' : `${h} hours ago`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Confidence {
  /** 0–100. Stock Pulse signal strength. */
  score: number;
  level: ConfidenceLevel;
  label: string;
}

/**
 * Confidence blends how recently the pharmacy confirmed the figure with
 * whether the pharmacy is network-verified. Stale listings decay quickly —
 * a six-hour-old count is the cutoff for "high".
 */
export function computeConfidence(
  updatedMinutesAgo: number,
  verified: boolean,
): Confidence {
  // Freshness decays over 24h, weighted so the first hours matter most.
  const decay = Math.min(1, updatedMinutesAgo / (24 * 60));
  const freshness = Math.round((1 - decay ** 0.55) * 100);
  const score = Math.max(5, Math.min(99, freshness - (verified ? 0 : 18)));

  const level: ConfidenceLevel =
    score >= 75 ? 'high' : score >= 45 ? 'medium' : 'low';

  return {
    score,
    level,
    label:
      level === 'high'
        ? 'High confidence'
        : level === 'medium'
          ? 'Medium confidence'
          : 'Low confidence',
  };
}

/* -------------------------------------------------------------------------- */
/* Search                                                                      */
/* -------------------------------------------------------------------------- */

export interface AvailabilityResult {
  pharmacy: Pharmacy;
  quantity: number;
  priceEGP: number;
  distanceKm: number;
  updatedMinutesAgo: number;
  confidence: Confidence;
  /** Convenience flag: quantity > 0. */
  inStock: boolean;
}

export type RingOutcome = 'found' | 'low-only' | 'empty';

export interface RingResult {
  radius: RadiusStep;
  /** In-stock results inside this ring, nearest first. */
  results: AvailabilityResult[];
  /** Pharmacies in-ring that confirmed zero stock — proof we looked. */
  checkedCount: number;
  outOfStockCount: number;
  outcome: RingOutcome;
}

/** Availability for one medicine within a radius, nearest first. */
export function searchRing(
  medicine: Medicine,
  origin: SavedLocation,
  radius: RadiusStep,
): RingResult {
  const rows = STOCK.filter((s) => s.medicineId === medicine.id);

  const inRing = rows
    .map((row) => {
      const pharmacy = PHARMACIES.find((p) => p.id === row.pharmacyId);
      if (!pharmacy) return null;
      const km = distanceKm(origin, pharmacy);
      if (km > radius) return null;

      return {
        pharmacy,
        quantity: row.quantity,
        priceEGP: row.priceEGP,
        distanceKm: km,
        updatedMinutesAgo: row.updatedMinutesAgo,
        confidence: computeConfidence(row.updatedMinutesAgo, pharmacy.verified),
        inStock: row.quantity > 0,
      } satisfies AvailabilityResult;
    })
    .filter((r): r is AvailabilityResult => r !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const results = inRing.filter((r) => r.inStock);
  const outOfStockCount = inRing.length - results.length;

  // "low-only" = found something, but nothing you'd rely on: every hit is
  // either a couple of units or a low-confidence listing.
  const dependable = results.filter(
    (r) => r.quantity >= 3 && r.confidence.level !== 'low',
  );
  const outcome: RingOutcome =
    results.length === 0 ? 'empty' : dependable.length === 0 ? 'low-only' : 'found';

  return {
    radius,
    results,
    checkedCount: inRing.length,
    outOfStockCount,
    outcome,
  };
}

/** The next ring after `radius`, or null when the network is exhausted. */
export function nextRadius(radius: RadiusStep): RadiusStep | null {
  const i = RADIUS_STEPS.indexOf(radius);
  return i >= 0 && i < RADIUS_STEPS.length - 1 ? RADIUS_STEPS[i + 1] : null;
}

/** Total pharmacies the network could still check beyond this ring. */
export function pharmaciesBeyond(
  medicine: Medicine,
  origin: SavedLocation,
  radius: RadiusStep,
): number {
  return STOCK.filter((s) => s.medicineId === medicine.id).filter((s) => {
    const pharmacy = PHARMACIES.find((p) => p.id === s.pharmacyId);
    if (!pharmacy) return false;
    return distanceKm(origin, pharmacy) > radius;
  }).length;
}
