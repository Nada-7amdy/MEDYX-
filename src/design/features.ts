import type { CapsuleAccent, CapsuleStatus } from './capsuleStates';

/**
 * The seven MEDYX product features. Nothing outside this list belongs on the
 * homepage — no cold chain, no system logs, no compliance, no KPI grid.
 */
export type FeatureId =
  | 'rescue-search'
  | 'gemini-ai'
  | 'stock-pulse'
  | 'shortage-radar'
  | 'pharmacy-network'
  | 'rescue-support'
  | 'supply-intelligence';

export interface FeatureDef {
  id: FeatureId;
  /** Short capsule label. */
  title: string;
  /** One-line value statement shown in the resting capsule. */
  tagline: string;
  /** Longer explanation revealed on expand. */
  detail: string;
  /** Bullet points revealed on expand — kept to 3, no feature bloat. */
  points: string[];
  status: CapsuleStatus;
  /** Feature-appropriate chip word. Status tone stays a *visual* signal. */
  statusLabel: string;
  accent: CapsuleAccent;
  /** Small live metric shown on the right of the capsule. */
  metric?: { value: string; caption: string };
  /** The hero capsule renders larger and leads the grid. */
  primary?: boolean;
}

export const FEATURES: FeatureDef[] = [
  {
    id: 'rescue-search',
    title: 'Rescue Search',
    tagline: 'Stock unavailable nearby? Expand the radius until it is found.',
    detail:
      'When a medicine is out of stock at every pharmacy near you, Rescue Search widens the search ring step by step — 2 km, 5 km, 15 km, city-wide — and keeps hunting live pharmacy stock until it locates a verified unit.',
    points: [
      'Automatic radius expansion with live pharmacy stock checks',
      'Reserves the unit the moment a verified match appears',
      'Falls back to Rescue Support if cost is the blocker',
    ],
    status: 'success',
    statusLabel: 'Primary',
    accent: 'medic',
    metric: { value: '15 km', caption: 'current ring' },
    primary: true,
  },
  {
    id: 'gemini-ai',
    title: 'Gemini AI',
    tagline: 'Describe the medicine in plain words — or scan the box.',
    detail:
      'Gemini understands misspelled brand names, local names, dosages and photos of a prescription box, then maps them to the exact molecule and strength so the search actually returns something.',
    points: [
      'Brand, generic and local-name matching',
      'Suggests equivalent alternatives with the same molecule',
      'Never diagnoses — it only helps identify and locate',
    ],
    status: 'neutral',
    statusLabel: 'Assist',
    accent: 'cyan',
    metric: { value: 'Live', caption: 'assistant' },
  },
  {
    id: 'stock-pulse',
    title: 'Stock Pulse',
    tagline: 'Real-time availability signal from the pharmacy network.',
    detail:
      'Every pharmacy in the network reports stock movement continuously. Stock Pulse turns that stream into a single confidence signal so you know whether a listing is fresh or stale before you travel.',
    points: [
      'Confidence score based on last verified update',
      'Flags listings older than six hours',
      'Highlights pharmacies that restock predictably',
    ],
    status: 'success',
    statusLabel: 'Live',
    accent: 'neon',
    metric: { value: '98%', caption: 'signal fresh' },
  },
  {
    id: 'shortage-radar',
    title: 'Shortage Radar',
    tagline: 'See a shortage forming before the shelves empty.',
    detail:
      'Shortage Radar watches demand spikes and refill failures across regions to forecast which medicines are about to become hard to obtain, giving you time to secure a supply early.',
    points: [
      'Regional shortage risk scoring',
      'Early warning on medicines you rely on',
      'Suggests when to refill ahead of a squeeze',
    ],
    status: 'warning',
    statusLabel: 'Watching',
    accent: 'medic',
    metric: { value: '3', caption: 'watch alerts' },
  },
  {
    id: 'pharmacy-network',
    title: 'Pharmacy Network',
    tagline: 'Verified pharmacies that confirm stock before you travel.',
    detail:
      'A connected network of pharmacies that keep their availability current and confirm a hold before you leave home, so a listed medicine is actually waiting at the counter.',
    points: [
      'Confirmed hold before pickup',
      'Distance, hours and contact in one view',
      'Pickup or delivery, chosen at the pharmacy',
    ],
    status: 'neutral',
    statusLabel: 'Verified',
    accent: 'cyan',
    metric: { value: '1,240', caption: 'pharmacies' },
  },
  {
    id: 'rescue-support',
    title: 'Rescue Support',
    tagline: 'Pre-funded help when the medicine is found but out of reach.',
    detail:
      'For eligible patients, Rescue Support covers part or all of a critical medicine through pre-funded donor pools. It is a support programme — not insurance, and not a government benefit.',
    points: [
      'Eligibility checked in a single short step',
      'Funds released directly to the pharmacy',
      'Optional — the search works without it',
    ],
    status: 'critical',
    statusLabel: 'Eligibility',
    accent: 'medic',
    metric: { value: 'Active', caption: 'fund status' },
  },
  {
    id: 'supply-intelligence',
    title: 'Supply Intelligence',
    tagline: 'Where the supply is moving, and where it is drying up.',
    detail:
      'Aggregated, anonymised movement across the network shows how a medicine is flowing between districts — so a search can be routed toward the areas that are actually being resupplied.',
    points: [
      'District-level supply flow',
      'Restock timing patterns',
      'Routes searches toward recovering areas',
    ],
    status: 'neutral',
    statusLabel: 'Insight',
    accent: 'cyan',
    metric: { value: '24 h', caption: 'refresh' },
  },
];

export const PRIMARY_FEATURE = FEATURES.find((f) => f.primary)!;

/**
 * The supporting capsules shown on MEDYX Home.
 *
 * Only four: Gemini AI, Shortage Radar, Rescue Support and Pharmacy Network.
 * Stock Pulse and Supply Intelligence stay defined above (they remain part of
 * the product) but are withheld from Home so nothing competes with Medicine
 * Search for attention.
 */
export const HOME_SECONDARY_FEATURE_IDS: FeatureId[] = [
  'gemini-ai',
  'shortage-radar',
  'rescue-support',
  'pharmacy-network',
];

export const HOME_SECONDARY_FEATURES: FeatureDef[] =
  HOME_SECONDARY_FEATURE_IDS.map((id) => FEATURES.find((f) => f.id === id)!);
