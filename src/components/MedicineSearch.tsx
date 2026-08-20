import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CAPSULE_SPRING } from '../design/capsuleStates';
import { ArrowIcon, CameraIcon, SparkIcon } from './Icons';
import { LocationPicker } from './rescue/LocationPicker';
import { suggestMedicines } from '../lib/rescueSearch';
import type { SavedLocation } from '../data/demoData';

const QUICK_PICKS = [
  { label: 'Insulin Glargine', hint: 'found at 25 km' },
  { label: 'Ventolin', hint: 'found at 10 km' },
  { label: 'Tegretol', hint: 'found at 50 km' },
  { label: 'Metformin', hint: 'in stock nearby' },
];

/**
 * Primary interaction: medicine search with location awareness and Gemini AI
 * assistance. Wired to the Rescue Search engine in Phase 2.
 */
export function MedicineSearch({
  onSearch,
  searching = false,
  location,
  onLocationChange,
}: {
  onSearch?: (query: string) => void;
  searching?: boolean;
  location: SavedLocation;
  onLocationChange: (next: SavedLocation) => void;
}) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  const suggestions = showSuggest ? suggestMedicines(query) : [];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function run(value: string) {
    const v = value.trim();
    if (!v) return;
    setQuery(v);
    setShowSuggest(false);
    onSearch?.(v);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    run(query);
  }

  return (
    <div ref={wrap} className="relative w-full">
      <motion.form
        onSubmit={submit}
        animate={{ scale: focused ? 1.008 : 1 }}
        transition={CAPSULE_SPRING}
        className={[
          'group relative flex flex-col gap-2 rounded-panel border bg-paper/92 p-2 backdrop-blur-xl transition-all duration-300 sm:flex-row sm:items-center sm:gap-1.5 sm:rounded-capsule sm:p-2',
          focused
            ? 'border-medic-300 shadow-lift'
            : 'border-ice-300 shadow-soft hover:border-cyan-300',
        ].join(' ')}
        style={{
          boxShadow: focused
            ? '0 0 0 4px rgba(52,205,136,0.12), 0 22px 50px rgba(14,32,41,0.12)'
            : undefined,
        }}
      >
        <LocationPicker location={location} onChange={onLocationChange} />

        <div className="flex min-w-0 flex-1 items-center gap-2 px-1.5">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggest(true);
            }}
            onFocus={() => {
              setFocused(true);
              setShowSuggest(true);
            }}
            onBlur={() => setFocused(false)}
            placeholder="Search a medicine, brand or molecule…"
            aria-label="Search for a medicine"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none sm:py-2 sm:text-base"
          />
          <button
            type="button"
            aria-label="Scan medicine box with Gemini AI"
            title="Scan the box — Gemini AI (later phase)"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors duration-300 hover:bg-cyan-100 hover:text-cyan-600"
          >
            <CameraIcon className="size-[18px]" />
          </button>
        </div>

        <button
          type="submit"
          disabled={searching}
          className="group/btn relative flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-capsule action-fill px-5 py-3 text-[14px] font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:opacity-70 sm:px-6"
          style={{ boxShadow: '0 8px 22px rgba(18,180,119,0.28)' }}
        >
          {searching && (
            <span
              aria-hidden
              className="animate-shimmer absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                backgroundSize: '180% 100%',
              }}
            />
          )}
          <span className="relative">{searching ? 'Searching…' : 'Find medicine'}</span>
          <ArrowIcon className="relative size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
        </button>

        {/* Type-ahead */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="glass-panel absolute top-full right-0 left-0 z-40 mt-2 rounded-soft p-1.5"
            >
              {suggestions.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => run(m.name)}
                    className="flex w-full items-center justify-between gap-3 rounded-capsule px-3 py-2 text-left transition-colors duration-200 hover:bg-ice-100"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-ink-800">
                        {m.name}
                      </span>
                      <span className="block truncate text-[12px] text-ink-400">
                        {m.molecule} · {m.form}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-400">
                      {m.strength}
                    </span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Gemini hint + demo quick picks */}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-cyan-600">
          <SparkIcon className="size-3.5" />
          Gemini AI understands misspellings, brands and local names
        </span>
        <span aria-hidden className="hidden text-ink-300 sm:inline">|</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_PICKS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => run(s.label)}
              title={`Demo: ${s.hint}`}
              className="rounded-capsule border border-ice-300 bg-paper/70 px-2.5 py-1 text-[12px] text-ink-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-600"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
