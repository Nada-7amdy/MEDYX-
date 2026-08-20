import { motion } from 'motion/react';
import { MedicineSearch } from './MedicineSearch';
import type { SavedLocation } from '../data/demoData';

/**
 * The homepage must say two things instantly:
 *   "Find the medicine."  /  "Rescue the supply."
 */
export function Hero({
  onSearch,
  searching,
  location,
  onLocationChange,
  greetingName,
}: {
  onSearch: (q: string) => void;
  searching: boolean;
  location: SavedLocation;
  onLocationChange: (next: SavedLocation) => void;
  /** Signed-in first name — swaps the marketing badge for a greeting. */
  greetingName?: string;
}) {
  return (
    <section className="pt-10 text-center sm:pt-16">
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 rounded-capsule border border-medic-200 bg-paper/80 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-medic-700 uppercase shadow-soft backdrop-blur-sm"
      >
        <span className="relative flex size-1.5">
          <span className="animate-pulse-dot absolute inline-flex size-1.5 rounded-full bg-neon-500" />
        </span>
        {greetingName ? `Welcome back, ${greetingName}` : 'Medicine availability intelligence'}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06 }}
        className="text-balance mx-auto mt-5 max-w-3xl text-[34px] leading-[1.06] font-bold tracking-[-0.03em] text-ink-900 sm:mt-6 sm:text-[58px]"
      >
        Find the medicine.
        <br />
        <span className="headline-gradient">
          Rescue the supply.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12 }}
        className="text-balance mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-500 sm:mt-5 sm:text-[17px]"
      >
        Search live pharmacy availability near you. When stock runs out, MEDYX
        widens the radius until a verified unit is found.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18 }}
        className="mx-auto mt-8 max-w-3xl sm:mt-10"
      >
        <MedicineSearch
          onSearch={onSearch}
          searching={searching}
          location={location}
          onLocationChange={onLocationChange}
        />
      </motion.div>

      {/* Journey strip */}
      <motion.ol
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mx-auto mt-9 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[11px] font-medium tracking-wide text-ink-400 sm:mt-11 sm:text-[12px]"
      >
        {[
          'Search',
          'Availability',
          'Rescue Search',
          'Pharmacy',
          'Support',
          'Pickup',
        ].map((step, i, arr) => (
          <li key={step} className="flex items-center gap-2">
            <span className="rounded-capsule border border-ice-300 bg-paper/70 px-2.5 py-1 whitespace-nowrap text-ink-600">
              {step}
            </span>
            {i < arr.length - 1 && (
              <span aria-hidden className="text-ice-400">
                ›
              </span>
            )}
          </li>
        ))}
      </motion.ol>
    </section>
  );
}
