import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LOCATIONS,
  DEFAULT_LOCATION_ID,
  type SavedLocation,
} from '../data/demoData';
import {
  RADIUS_STEPS,
  matchMedicine,
  nextRadius,
  pharmaciesBeyond,
  searchRing,
  type MedicineMatch,
  type RadiusStep,
  type RingResult,
} from './rescueSearch';

export type SearchPhase =
  | 'idle'
  | 'searching'
  | 'results'
  | 'expanding'
  | 'exhausted'
  | 'not-found';

export interface RescueSearchState {
  phase: SearchPhase;
  match: MedicineMatch | null;
  ring: RingResult | null;
  radius: RadiusStep;
  location: SavedLocation;
  /** Rings already swept, oldest first — the rescue trail. */
  history: RingResult[];
  /** Pharmacies still unchecked beyond the current ring. */
  beyond: number;
  query: string;
  /** True while a ring sweep animation is running. */
  busy: boolean;
}

/** Simulated network latency so Stock Pulse feels live. */
const SWEEP_MS = 1150;

export function useRescueSearch() {
  const [location, setLocation] = useState<SavedLocation>(
    LOCATIONS.find((l) => l.id === DEFAULT_LOCATION_ID) ?? LOCATIONS[0],
  );
  const [phase, setPhase] = useState<SearchPhase>('idle');
  const [match, setMatch] = useState<MedicineMatch | null>(null);
  const [radius, setRadius] = useState<RadiusStep>(RADIUS_STEPS[0]);
  const [ring, setRing] = useState<RingResult | null>(null);
  const [history, setHistory] = useState<RingResult[]>([]);
  const [query, setQuery] = useState('');

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clear, []);

  /** Resolve a ring after a short sweep delay. */
  const sweep = useCallback(
    (
      m: MedicineMatch,
      origin: SavedLocation,
      r: RadiusStep,
      opts: { append: boolean },
    ) => {
      clear();
      timer.current = setTimeout(() => {
        const result = searchRing(m.medicine, origin, r);
        setRing(result);
        setHistory((prev) => (opts.append ? [...prev, result] : [result]));

        if (result.results.length > 0) {
          setPhase('results');
        } else if (nextRadius(r) === null) {
          setPhase('exhausted');
        } else {
          // Nothing here, but the network can still go wider.
          setPhase('results');
        }
      }, SWEEP_MS);
    },
    [],
  );

  /** Run a fresh search from the innermost ring. */
  const search = useCallback(
    (raw: string, origin: SavedLocation = location) => {
      const trimmed = raw.trim();
      setQuery(trimmed);
      if (!trimmed) return;

      const found = matchMedicine(trimmed);
      setHistory([]);
      setRing(null);
      setRadius(RADIUS_STEPS[0]);

      if (!found) {
        setMatch(null);
        setPhase('not-found');
        return;
      }

      setMatch(found);
      setPhase('searching');
      sweep(found, origin, RADIUS_STEPS[0], { append: false });
    },
    [location, sweep],
  );

  /** Widen to the next ring: 5 → 10 → 25 → 50 km. */
  const expandRadius = useCallback(() => {
    if (!match) return;
    const next = nextRadius(radius);
    if (!next) {
      setPhase('exhausted');
      return;
    }
    setRadius(next);
    setPhase('expanding');
    sweep(match, location, next, { append: true });
  }, [match, radius, location, sweep]);

  /** Change location — re-runs the active search from the first ring. */
  const changeLocation = useCallback(
    (next: SavedLocation) => {
      setLocation(next);
      if (match) search(match.rawQuery, next);
    },
    [match, search],
  );

  const reset = useCallback(() => {
    clear();
    setPhase('idle');
    setMatch(null);
    setRing(null);
    setHistory([]);
    setRadius(RADIUS_STEPS[0]);
    setQuery('');
  }, []);

  const state: RescueSearchState = {
    phase,
    match,
    ring,
    radius,
    location,
    history,
    beyond: match ? pharmaciesBeyond(match.medicine, location, radius) : 0,
    query,
    busy: phase === 'searching' || phase === 'expanding',
  };

  return { ...state, search, expandRadius, changeLocation, setLocation, reset };
}
