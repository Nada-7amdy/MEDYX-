import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LOCATIONS, type SavedLocation } from '../../data/demoData';
import { PinIcon, CheckIcon, ChevronIcon } from '../Icons';

/** Location awareness for the search. Demo locations only — no geolocation API. */
export function LocationPicker({
  location,
  onChange,
  compact = false,
}: {
  location: SavedLocation;
  onChange: (next: SavedLocation) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={[
          'flex w-full items-center gap-2 rounded-capsule text-[13px] font-semibold text-ink-700 transition-colors duration-300',
          compact
            ? 'border border-ice-300 bg-paper px-3 py-2 hover:border-cyan-300'
            : 'bg-ice-100 px-3.5 py-2.5 hover:bg-ice-200 sm:py-3',
        ].join(' ')}
      >
        <PinIcon className="size-4 shrink-0 text-cyan-500" />
        <span className="truncate">{location.label}</span>
        <ChevronIcon
          className={`size-3.5 shrink-0 text-ink-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="glass-panel absolute top-full left-0 z-40 mt-2 w-56 rounded-soft p-1.5"
          >
            <li className="px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-ink-400 uppercase">
              Demo locations
            </li>
            {LOCATIONS.map((loc) => {
              const active = loc.id === location.id;
              return (
                <li key={loc.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(loc);
                      setOpen(false);
                    }}
                    className={[
                      'flex w-full items-center justify-between gap-2 rounded-capsule px-2.5 py-2 text-left text-[13px] transition-colors duration-200',
                      active
                        ? 'bg-medic-100 font-semibold text-medic-800'
                        : 'text-ink-700 hover:bg-ice-100',
                    ].join(' ')}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{loc.label}</span>
                      <span className="block text-[11px] text-ink-400">{loc.area}</span>
                    </span>
                    {active && <CheckIcon className="size-4 shrink-0 text-medic-600" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
