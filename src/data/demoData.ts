/**
 * ============================================================================
 * MEDYX — DEMO / MOCK DATA
 * ============================================================================
 *
 * Everything in this file is FICTIONAL and exists only to make the Rescue
 * Search experience explorable. No real pharmacy, inventory or pricing API is
 * connected in this phase.
 *
 * Pharmacy names are invented. Coordinates are approximate real Cairo-area
 * districts so that distance maths and radius expansion behave realistically.
 *
 * Replace this module with a real data layer in a later phase — the search
 * engine in `src/lib/rescueSearch.ts` only depends on the exported types.
 */

export const DEMO_NOTICE =
  'Demo data — pharmacies, stock levels and update times are simulated.';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface Medicine {
  id: string;
  /** Display name, usually the brand patients ask for. */
  name: string;
  /** Active molecule. */
  molecule: string;
  strength: string;
  form: string;
  /** Alternative spellings, local names and brand equivalents. */
  aliases: string[];
  /** Shortage Radar signal for this molecule. */
  shortageRisk: 'low' | 'moderate' | 'high' | 'critical';
  /** Set when the medicine is commonly eligible for Rescue Support. */
  supportEligible?: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  hours: string;
  /** Verified pharmacies confirm a hold before pickup. */
  verified: boolean;
  delivery: boolean;
}

export interface StockRecord {
  pharmacyId: string;
  medicineId: string;
  /** Units currently on the shelf. 0 means confirmed out of stock. */
  quantity: number;
  /** How long ago the pharmacy last confirmed this figure. */
  updatedMinutesAgo: number;
  /** Unit price in EGP. */
  priceEGP: number;
}

export interface SavedLocation {
  id: string;
  label: string;
  area: string;
  lat: number;
  lng: number;
}

/* -------------------------------------------------------------------------- */
/* Locations                                                                   */
/* -------------------------------------------------------------------------- */

export const LOCATIONS: SavedLocation[] = [
  { id: 'zamalek', label: 'Zamalek', area: 'Cairo', lat: 30.0614, lng: 31.2197 },
  { id: 'nasr-city', label: 'Nasr City', area: 'Cairo', lat: 30.0626, lng: 31.345 },
  { id: 'maadi', label: 'Maadi', area: 'Cairo', lat: 29.9603, lng: 31.2569 },
  { id: 'giza', label: 'Giza', area: 'Giza', lat: 30.0131, lng: 31.2089 },
  { id: 'october', label: '6th of October', area: 'Giza', lat: 29.9285, lng: 30.9188 },
];

export const DEFAULT_LOCATION_ID = 'zamalek';

/* -------------------------------------------------------------------------- */
/* Medicines                                                                   */
/* -------------------------------------------------------------------------- */

export const MEDICINES: Medicine[] = [
  {
    id: 'insulin-glargine',
    name: 'Insulin Glargine',
    molecule: 'Insulin glargine',
    strength: '100 IU/mL',
    form: 'Pre-filled pen',
    aliases: ['lantus', 'basaglar', 'insuline', 'glargin', 'انسولين'],
    shortageRisk: 'high',
    supportEligible: true,
  },
  {
    id: 'salbutamol',
    name: 'Salbutamol Inhaler',
    molecule: 'Salbutamol',
    strength: '100 mcg/dose',
    form: 'Inhaler',
    aliases: ['ventolin', 'albuterol', 'salbutamol', 'بخاخ'],
    shortageRisk: 'moderate',
  },
  {
    id: 'amoxicillin',
    name: 'Amoxicillin 500mg',
    molecule: 'Amoxicillin',
    strength: '500 mg',
    form: 'Capsules',
    aliases: ['amoxil', 'amoxicilin', 'e-mox', 'أموكسيسيلين'],
    shortageRisk: 'moderate',
  },
  {
    id: 'metformin',
    name: 'Metformin 850mg',
    molecule: 'Metformin HCl',
    strength: '850 mg',
    form: 'Tablets',
    aliases: ['glucophage', 'cidophage', 'metformine', 'ميتفورمين'],
    shortageRisk: 'low',
  },
  {
    id: 'carbamazepine',
    name: 'Carbamazepine 200mg',
    molecule: 'Carbamazepine',
    strength: '200 mg',
    form: 'Tablets',
    aliases: ['tegretol', 'carbamazepin', 'كاربامازيبين'],
    shortageRisk: 'critical',
    supportEligible: true,
  },
  {
    id: 'levothyroxine',
    name: 'Levothyroxine 50mcg',
    molecule: 'Levothyroxine sodium',
    strength: '50 mcg',
    form: 'Tablets',
    aliases: ['eltroxin', 'euthyrox', 'thyroxine'],
    shortageRisk: 'high',
  },
  {
    id: 'warfarin',
    name: 'Warfarin 5mg',
    molecule: 'Warfarin sodium',
    strength: '5 mg',
    form: 'Tablets',
    aliases: ['marevan', 'coumadin', 'warfarine'],
    shortageRisk: 'high',
    supportEligible: true,
  },
  {
    id: 'omeprazole',
    name: 'Omeprazole 20mg',
    molecule: 'Omeprazole',
    strength: '20 mg',
    form: 'Capsules',
    aliases: ['losec', 'gastrazole', 'omeprazol'],
    shortageRisk: 'low',
  },
];

/* -------------------------------------------------------------------------- */
/* Pharmacy network                                                            */
/* -------------------------------------------------------------------------- */

export const PHARMACIES: Pharmacy[] = [
  // --- Inner ring (≈0–5 km from Zamalek) ---
  { id: 'ph-nile', name: 'Nile Care Pharmacy', district: 'Zamalek', lat: 30.0625, lng: 31.2205, hours: '24 hours', verified: true, delivery: true },
  { id: 'ph-gezira', name: 'Gezira Family Pharmacy', district: 'Zamalek', lat: 30.0578, lng: 31.2231, hours: '9:00 – 23:00', verified: true, delivery: false },
  { id: 'ph-tahrir', name: 'Tahrir Central Pharmacy', district: 'Downtown', lat: 30.0444, lng: 31.2357, hours: '24 hours', verified: true, delivery: true },
  { id: 'ph-mohandessin', name: 'Mohandessin Health Point', district: 'Mohandessin', lat: 30.0561, lng: 31.2001, hours: '8:00 – 24:00', verified: true, delivery: true },
  { id: 'ph-dokki', name: 'Dokki Care Chemist', district: 'Dokki', lat: 30.0385, lng: 31.2118, hours: '9:00 – 22:00', verified: false, delivery: false },
  { id: 'ph-garden', name: 'Garden City Pharmacy', district: 'Garden City', lat: 30.035, lng: 31.23, hours: '9:00 – 21:00', verified: true, delivery: false },

  // --- Middle ring (≈5–15 km) ---
  { id: 'ph-giza', name: 'Giza Plateau Pharmacy', district: 'Giza', lat: 30.0131, lng: 31.2089, hours: '8:00 – 23:00', verified: true, delivery: true },
  { id: 'ph-shubra', name: 'Shubra Community Pharmacy', district: 'Shubra', lat: 30.1218, lng: 31.2445, hours: '24 hours', verified: false, delivery: true },
  { id: 'ph-heliopolis', name: 'Heliopolis Medical Pharmacy', district: 'Heliopolis', lat: 30.0808, lng: 31.322, hours: '24 hours', verified: true, delivery: true },
  { id: 'ph-nasr', name: 'Nasr City Chemist', district: 'Nasr City', lat: 30.0626, lng: 31.345, hours: '9:00 – 24:00', verified: true, delivery: true },
  { id: 'ph-maadi', name: 'Maadi Riverside Pharmacy', district: 'Maadi', lat: 29.9603, lng: 31.2569, hours: '8:00 – 23:00', verified: true, delivery: true },

  // --- Outer ring (≈15–35 km) ---
  { id: 'ph-newcairo', name: 'New Cairo Specialist Pharmacy', district: 'New Cairo', lat: 30.0074, lng: 31.4913, hours: '10:00 – 23:00', verified: true, delivery: true },
  { id: 'ph-helwan', name: 'Helwan Industrial Pharmacy', district: 'Helwan', lat: 29.8419, lng: 31.3341, hours: '9:00 – 21:00', verified: false, delivery: false },
  { id: 'ph-october', name: '6th October Central Pharmacy', district: '6th of October', lat: 29.9285, lng: 30.9188, hours: '24 hours', verified: true, delivery: true },
  { id: 'ph-obour', name: 'Obour City Pharmacy', district: 'Obour', lat: 30.228, lng: 31.47, hours: '9:00 – 22:00', verified: true, delivery: false },

  // --- Far ring (≈35–60 km) ---
  { id: 'ph-banha', name: 'Banha Regional Pharmacy', district: 'Banha', lat: 30.46, lng: 31.184, hours: '9:00 – 21:00', verified: true, delivery: true },
  { id: 'ph-ramadan', name: '10th of Ramadan Depot Pharmacy', district: '10th of Ramadan', lat: 30.296, lng: 31.742, hours: '8:00 – 20:00', verified: true, delivery: true },
  { id: 'ph-fayoum-rd', name: 'Fayoum Road Pharmacy', district: 'Fayoum Road', lat: 29.7204, lng: 30.9421, hours: '9:00 – 21:00', verified: false, delivery: false },
];

/* -------------------------------------------------------------------------- */
/* Stock records                                                               */
/* -------------------------------------------------------------------------- */
/*
 * Authored so each medicine tells a different Rescue Search story from the
 * default Zamalek location:
 *
 *   metformin      → plenty in the inner ring (success at 5 km)
 *   amoxicillin    → only low/stale stock nearby (warning at 5 km)
 *   salbutamol     → out nearby, healthy stock at 10 km
 *   insulin-glargine → nothing until 10 km, then a single verified pen
 *   levothyroxine  → nothing until 25 km
 *   carbamazepine  → nothing until 50 km — the full rescue journey
 *   warfarin       → nothing anywhere — exhausted, Rescue Support path
 */

export const STOCK: StockRecord[] = [
  /* --- Metformin: widely available --------------------------------------- */
  { pharmacyId: 'ph-nile', medicineId: 'metformin', quantity: 24, updatedMinutesAgo: 8, priceEGP: 68 },
  { pharmacyId: 'ph-gezira', medicineId: 'metformin', quantity: 12, updatedMinutesAgo: 42, priceEGP: 70 },
  { pharmacyId: 'ph-tahrir', medicineId: 'metformin', quantity: 31, updatedMinutesAgo: 19, priceEGP: 66 },
  { pharmacyId: 'ph-dokki', medicineId: 'metformin', quantity: 6, updatedMinutesAgo: 310, priceEGP: 72 },
  { pharmacyId: 'ph-heliopolis', medicineId: 'metformin', quantity: 18, updatedMinutesAgo: 55, priceEGP: 67 },

  /* --- Amoxicillin: low + stale nearby ----------------------------------- */
  { pharmacyId: 'ph-gezira', medicineId: 'amoxicillin', quantity: 2, updatedMinutesAgo: 26, priceEGP: 95 },
  { pharmacyId: 'ph-dokki', medicineId: 'amoxicillin', quantity: 3, updatedMinutesAgo: 640, priceEGP: 92 },
  { pharmacyId: 'ph-garden', medicineId: 'amoxicillin', quantity: 0, updatedMinutesAgo: 70, priceEGP: 90 },
  { pharmacyId: 'ph-giza', medicineId: 'amoxicillin', quantity: 0, updatedMinutesAgo: 180, priceEGP: 94 },
  { pharmacyId: 'ph-nasr', medicineId: 'amoxicillin', quantity: 15, updatedMinutesAgo: 33, priceEGP: 88 },
  { pharmacyId: 'ph-maadi', medicineId: 'amoxicillin', quantity: 9, updatedMinutesAgo: 120, priceEGP: 91 },

  /* --- Salbutamol: out nearby, stock at 10 km ---------------------------- */
  { pharmacyId: 'ph-nile', medicineId: 'salbutamol', quantity: 0, updatedMinutesAgo: 35, priceEGP: 145 },
  { pharmacyId: 'ph-tahrir', medicineId: 'salbutamol', quantity: 0, updatedMinutesAgo: 90, priceEGP: 150 },
  { pharmacyId: 'ph-mohandessin', medicineId: 'salbutamol', quantity: 0, updatedMinutesAgo: 150, priceEGP: 148 },
  { pharmacyId: 'ph-giza', medicineId: 'salbutamol', quantity: 0, updatedMinutesAgo: 240, priceEGP: 147 },
  { pharmacyId: 'ph-shubra', medicineId: 'salbutamol', quantity: 6, updatedMinutesAgo: 28, priceEGP: 146 },
  { pharmacyId: 'ph-heliopolis', medicineId: 'salbutamol', quantity: 7, updatedMinutesAgo: 22, priceEGP: 152 },
  { pharmacyId: 'ph-nasr', medicineId: 'salbutamol', quantity: 4, updatedMinutesAgo: 61, priceEGP: 149 },
  { pharmacyId: 'ph-maadi', medicineId: 'salbutamol', quantity: 2, updatedMinutesAgo: 200, priceEGP: 155 },

  /* --- Insulin Glargine: nothing under 5 km ------------------------------ */
  { pharmacyId: 'ph-nile', medicineId: 'insulin-glargine', quantity: 0, updatedMinutesAgo: 15, priceEGP: 780 },
  { pharmacyId: 'ph-gezira', medicineId: 'insulin-glargine', quantity: 0, updatedMinutesAgo: 48, priceEGP: 790 },
  { pharmacyId: 'ph-tahrir', medicineId: 'insulin-glargine', quantity: 0, updatedMinutesAgo: 65, priceEGP: 775 },
  { pharmacyId: 'ph-mohandessin', medicineId: 'insulin-glargine', quantity: 0, updatedMinutesAgo: 180, priceEGP: 785 },
  { pharmacyId: 'ph-giza', medicineId: 'insulin-glargine', quantity: 0, updatedMinutesAgo: 200, priceEGP: 788 },
  { pharmacyId: 'ph-shubra', medicineId: 'insulin-glargine', quantity: 0, updatedMinutesAgo: 130, priceEGP: 792 },
  { pharmacyId: 'ph-heliopolis', medicineId: 'insulin-glargine', quantity: 3, updatedMinutesAgo: 12, priceEGP: 795 },
  { pharmacyId: 'ph-nasr', medicineId: 'insulin-glargine', quantity: 1, updatedMinutesAgo: 95, priceEGP: 810 },
  { pharmacyId: 'ph-newcairo', medicineId: 'insulin-glargine', quantity: 6, updatedMinutesAgo: 40, priceEGP: 820 },

  /* --- Levothyroxine: nothing under 25 km -------------------------------- */
  { pharmacyId: 'ph-nile', medicineId: 'levothyroxine', quantity: 0, updatedMinutesAgo: 25, priceEGP: 130 },
  { pharmacyId: 'ph-tahrir', medicineId: 'levothyroxine', quantity: 0, updatedMinutesAgo: 55, priceEGP: 128 },
  { pharmacyId: 'ph-giza', medicineId: 'levothyroxine', quantity: 0, updatedMinutesAgo: 140, priceEGP: 132 },
  { pharmacyId: 'ph-shubra', medicineId: 'levothyroxine', quantity: 0, updatedMinutesAgo: 190, priceEGP: 129 },
  { pharmacyId: 'ph-heliopolis', medicineId: 'levothyroxine', quantity: 0, updatedMinutesAgo: 75, priceEGP: 135 },
  { pharmacyId: 'ph-maadi', medicineId: 'levothyroxine', quantity: 0, updatedMinutesAgo: 210, priceEGP: 131 },
  { pharmacyId: 'ph-newcairo', medicineId: 'levothyroxine', quantity: 5, updatedMinutesAgo: 30, priceEGP: 138 },
  { pharmacyId: 'ph-october', medicineId: 'levothyroxine', quantity: 2, updatedMinutesAgo: 165, priceEGP: 136 },

  /* --- Carbamazepine: nothing until the 50 km ring ----------------------- */
  { pharmacyId: 'ph-nile', medicineId: 'carbamazepine', quantity: 0, updatedMinutesAgo: 20, priceEGP: 210 },
  { pharmacyId: 'ph-gezira', medicineId: 'carbamazepine', quantity: 0, updatedMinutesAgo: 80, priceEGP: 205 },
  { pharmacyId: 'ph-tahrir', medicineId: 'carbamazepine', quantity: 0, updatedMinutesAgo: 45, priceEGP: 212 },
  { pharmacyId: 'ph-giza', medicineId: 'carbamazepine', quantity: 0, updatedMinutesAgo: 155, priceEGP: 206 },
  { pharmacyId: 'ph-shubra', medicineId: 'carbamazepine', quantity: 0, updatedMinutesAgo: 220, priceEGP: 209 },
  { pharmacyId: 'ph-heliopolis', medicineId: 'carbamazepine', quantity: 0, updatedMinutesAgo: 60, priceEGP: 208 },
  { pharmacyId: 'ph-nasr', medicineId: 'carbamazepine', quantity: 0, updatedMinutesAgo: 130, priceEGP: 215 },
  { pharmacyId: 'ph-newcairo', medicineId: 'carbamazepine', quantity: 0, updatedMinutesAgo: 95, priceEGP: 220 },
  { pharmacyId: 'ph-october', medicineId: 'carbamazepine', quantity: 0, updatedMinutesAgo: 260, priceEGP: 218 },
  { pharmacyId: 'ph-banha', medicineId: 'carbamazepine', quantity: 4, updatedMinutesAgo: 50, priceEGP: 225 },
  { pharmacyId: 'ph-ramadan', medicineId: 'carbamazepine', quantity: 9, updatedMinutesAgo: 110, priceEGP: 222 },

  /* --- Warfarin: confirmed out across the whole network ------------------ */
  { pharmacyId: 'ph-nile', medicineId: 'warfarin', quantity: 0, updatedMinutesAgo: 18, priceEGP: 160 },
  { pharmacyId: 'ph-tahrir', medicineId: 'warfarin', quantity: 0, updatedMinutesAgo: 52, priceEGP: 158 },
  { pharmacyId: 'ph-gezira', medicineId: 'warfarin', quantity: 0, updatedMinutesAgo: 64, priceEGP: 159 },
  { pharmacyId: 'ph-giza', medicineId: 'warfarin', quantity: 0, updatedMinutesAgo: 145, priceEGP: 161 },
  { pharmacyId: 'ph-shubra', medicineId: 'warfarin', quantity: 0, updatedMinutesAgo: 205, priceEGP: 163 },
  { pharmacyId: 'ph-heliopolis', medicineId: 'warfarin', quantity: 0, updatedMinutesAgo: 88, priceEGP: 162 },
  { pharmacyId: 'ph-maadi', medicineId: 'warfarin', quantity: 0, updatedMinutesAgo: 175, priceEGP: 165 },
  { pharmacyId: 'ph-newcairo', medicineId: 'warfarin', quantity: 0, updatedMinutesAgo: 240, priceEGP: 168 },
  { pharmacyId: 'ph-banha', medicineId: 'warfarin', quantity: 0, updatedMinutesAgo: 300, priceEGP: 170 },
  { pharmacyId: 'ph-ramadan', medicineId: 'warfarin', quantity: 0, updatedMinutesAgo: 420, priceEGP: 166 },

  /* --- Omeprazole: comfortable everywhere -------------------------------- */
  { pharmacyId: 'ph-gezira', medicineId: 'omeprazole', quantity: 40, updatedMinutesAgo: 14, priceEGP: 55 },
  { pharmacyId: 'ph-mohandessin', medicineId: 'omeprazole', quantity: 22, updatedMinutesAgo: 36, priceEGP: 57 },
  { pharmacyId: 'ph-giza', medicineId: 'omeprazole', quantity: 17, updatedMinutesAgo: 100, priceEGP: 54 },
  { pharmacyId: 'ph-nasr', medicineId: 'omeprazole', quantity: 28, updatedMinutesAgo: 48, priceEGP: 56 },
];
