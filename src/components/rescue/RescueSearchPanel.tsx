import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RadiusRings } from './RadiusRings';
import { PharmacyCapsule } from './PharmacyCapsule';
import { LocationPicker } from './LocationPicker';
import { ArrowIcon, SearchExpandIcon, SparkIcon, SupportIcon } from '../Icons';
import { DEMO_NOTICE } from '../../data/demoData';
import { nextRadius, type RingResult } from '../../lib/rescueSearch';
import type { useRescueSearch } from '../../lib/useRescueSearch';

type Engine = ReturnType<typeof useRescueSearch>;

const RISK_COPY = {
  low: 'Low shortage risk',
  moderate: 'Moderate shortage risk',
  high: 'High shortage risk',
  critical: 'Critical shortage risk',
} as const;

/**
 * The Rescue Search feature interface. Rendered inside the expanded Rescue
 * Search capsule on the homepage.
 */
export function RescueSearchPanel({ engine }: { engine: Engine }) {
  const { phase, match, ring, radius, location, history, beyond, query, busy } = engine;

  // The nearest result auto-opens so the answer is visible immediately, but the
  // user may then open a different pharmacy. Rather than syncing that in an
  // effect (which causes a second render pass and a visible flash), the choice
  // is DERIVED during render: track which ring the current selection belongs
  // to, and fall back to the nearest result whenever a new ring arrives.
  // See: https://react.dev/learn/you-might-not-need-an-effect
  const [selection, setSelection] = useState<{
    ring: RingResult | null;
    pharmacyId: string | null;
  }>({ ring: null, pharmacyId: null });

  const openPharmacy =
    selection.ring === ring
      ? selection.pharmacyId
      : (ring?.results[0]?.pharmacy.id ?? null);

  const setOpenPharmacy = (pharmacyId: string | null) =>
    setSelection({ ring, pharmacyId });

  if (phase === 'idle') {
    return (
      <IdleState location={location} onLocation={engine.changeLocation} />
    );
  }

  if (phase === 'not-found') {
    return (
      <div className="rounded-soft border border-warn-400/40 bg-warn-100/60 px-4 py-4">
        <p className="text-[14px] font-semibold text-warn-700">
          No medicine matched “{query}”.
        </p>
        <p className="mt-1 text-[13px] text-ink-600">
          Try a brand name, the molecule, or pick one of the demo medicines
          below the search field.
        </p>
      </div>
    );
  }

  const found = Boolean(ring && ring.results.length > 0);
  const canExpand = nextRadius(radius) !== null;
  const exhausted = phase === 'exhausted' || (!found && !canExpand);

  // Single spoken summary of the current search state. Screen readers get the
  // outcome without having to explore the animated result subtree.
  const announcement = busy
    ? phase === 'expanding'
      ? `Expanding search to ${radius} kilometres. Checking pharmacies.`
      : `Checking pharmacies within ${radius} kilometres.`
    : exhausted
      ? `No pharmacy in the network reports ${match?.medicine.name ?? 'this medicine'} in stock.`
      : found
        ? `${ring!.results.length} pharmac${ring!.results.length === 1 ? 'y has' : 'ies have'} ${match?.medicine.name ?? 'this medicine'} within ${radius} kilometres.`
        : `No stock within ${radius} kilometres. ${canExpand ? `You can expand to ${nextRadius(radius)} kilometres.` : ''}`;

  return (
    <div className="grid gap-5 lg:grid-cols-[210px_1fr] lg:gap-7">
      {/* ---------------- Radius column ---------------- */}
      <div className="flex flex-col items-center gap-3">
        <RadiusRings radius={radius} busy={busy} found={found} />

        <div className="w-full max-w-[210px] text-center">
          <p className="font-mono text-[13px] font-semibold text-ink-800">
            {radius} km ring
          </p>
          <p className="mt-0.5 text-[11px] text-ink-400">
            from {location.label}
          </p>
        </div>

        <LocationPicker
          location={location}
          onChange={engine.changeLocation}
          compact
        />
      </div>

      {/* ---------------- Results column ---------------- */}
      <div className="min-w-0">
        {/* Resolved medicine header */}
        {match && (
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-ice-200 pb-4">
            <div className="min-w-0">
              <h3 className="text-[17px] font-bold tracking-tight text-ink-900">
                {match.medicine.name}
              </h3>
              <p className="mt-0.5 text-[13px] text-ink-500">
                {match.medicine.molecule} · {match.medicine.strength} ·{' '}
                {match.medicine.form}
              </p>
              {match.interpreted && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-cyan-600">
                  <SparkIcon className="size-3.5" />
                  Gemini AI read “{match.rawQuery}” as {match.medicine.molecule}
                </p>
              )}
            </div>
            <span
              className={[
                'rounded-capsule px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase',
                match.medicine.shortageRisk === 'critical'
                  ? 'bg-crit-100 text-crit-700'
                  : match.medicine.shortageRisk === 'high'
                    ? 'bg-warn-100 text-warn-700'
                    : match.medicine.shortageRisk === 'moderate'
                      ? 'bg-ice-200 text-ink-600'
                      : 'bg-medic-100 text-medic-800',
              ].join(' ')}
            >
              {RISK_COPY[match.medicine.shortageRisk]}
            </span>
          </div>
        )}

        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>

        {/* Sweep status */}
        <AnimatePresence mode="wait">
          {busy ? (
            <motion.div
              key="busy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              <p className="text-[13px] font-medium text-cyan-600">
                {phase === 'expanding'
                  ? `Expanding to ${radius} km — checking pharmacies…`
                  : `Checking pharmacies within ${radius} km…`}
              </p>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  aria-hidden
                  className="h-[62px] animate-pulse rounded-capsule border border-ice-200 bg-paper/60"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`ring-${radius}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Ring summary */}
              {ring && (
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500">
                  <span className="font-semibold text-ink-700">
                    {ring.results.length > 0
                      ? `${ring.results.length} pharmac${ring.results.length === 1 ? 'y has' : 'ies have'} stock`
                      : 'No stock in this ring'}
                  </span>
                  <span>·</span>
                  <span>{ring.checkedCount} checked</span>
                  {ring.outOfStockCount > 0 && (
                    <>
                      <span>·</span>
                      <span>{ring.outOfStockCount} confirmed out</span>
                    </>
                  )}
                </div>
              )}

              {/* Results */}
              {found ? (
                <div className="space-y-2.5">
                  {ring!.results.map((result) => (
                    <PharmacyCapsule
                      key={result.pharmacy.id}
                      result={result}
                      expanded={openPharmacy === result.pharmacy.id}
                      onToggle={(next) =>
                        setOpenPharmacy(next ? result.pharmacy.id : null)
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyRing radius={radius} checked={ring?.checkedCount ?? 0} />
              )}

              {/* Low-supply caution */}
              {found && ring!.outcome === 'low-only' && (
                <p className="mt-3 rounded-soft border border-warn-400/40 bg-warn-100/60 px-3.5 py-2.5 text-[12px] text-warn-700">
                  Only low or stale listings here. Expanding the radius usually
                  finds a more dependable unit.
                </p>
              )}

              {/* ------- Rescue actions ------- */}
              <div className="mt-4 border-t border-ice-200 pt-4">
                {exhausted ? (
                  <ExhaustedState medicineName={match?.medicine.name ?? ''} />
                ) : canExpand ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={engine.expandRadius}
                      className="group inline-flex items-center gap-2 rounded-capsule action-fill px-5 py-2.5 text-[13px] font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                      style={{ boxShadow: '0 8px 22px rgba(18,180,119,0.26)' }}
                    >
                      <SearchExpandIcon className="size-4" />
                      Expand to {nextRadius(radius)} km
                      <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </button>
                    <span className="text-[12px] text-ink-500">
                      {beyond > 0
                        ? `${beyond} more pharmac${beyond === 1 ? 'y' : 'ies'} beyond this ring`
                        : 'Widen the search across the network'}
                    </span>
                  </div>
                ) : (
                  // Found at the widest ring — there is nowhere left to expand.
                  <p className="text-[12px] text-ink-500">
                    This is the widest ring MEDYX searches. Reserve a unit above,
                    or change your location to search from somewhere closer.
                  </p>
                )}
              </div>

              {/* Rescue trail */}
              {history.length > 1 && (
                <ol className="mt-4 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <li className="text-ink-400">Rescue trail:</li>
                  {history.map((h) => (
                    <li
                      key={h.radius}
                      className={[
                        'rounded-capsule border px-2 py-0.5 font-mono',
                        h.results.length > 0
                          ? 'border-medic-200 bg-medic-50 text-medic-700'
                          : 'border-ice-300 bg-paper/70 text-ink-400',
                      ].join(' ')}
                    >
                      {h.radius}km · {h.results.length > 0 ? `${h.results.length} found` : 'none'}
                    </li>
                  ))}
                </ol>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-4 text-[11px] text-ink-400">{DEMO_NOTICE}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function IdleState({
  location,
  onLocation,
}: {
  location: Parameters<typeof LocationPicker>[0]['location'];
  onLocation: (l: Parameters<typeof LocationPicker>[0]['location']) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-[190px_1fr] sm:items-center">
      <RadiusRings radius={5} busy={false} found={false} />
      <div>
        <p className="text-[14px] leading-relaxed text-ink-600">
          Search a medicine above to begin. Rescue Search checks every pharmacy
          in the <strong className="font-semibold text-ink-800">5 km</strong>{' '}
          ring first, then widens to 10, 25 and 50 km until a verified unit is
          found.
        </p>
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <span className="text-[12px] text-ink-500">Searching from</span>
          <LocationPicker location={location} onChange={onLocation} compact />
        </div>
        <p className="mt-3 text-[11px] text-ink-400">{DEMO_NOTICE}</p>
      </div>
    </div>
  );
}

function EmptyRing({ radius, checked }: { radius: number; checked: number }) {
  return (
    <div className="rounded-soft border border-ice-300 bg-paper/70 px-4 py-5 text-center">
      <p className="text-[14px] font-semibold text-ink-800">
        Nothing available within {radius} km
      </p>
      <p className="mx-auto mt-1 max-w-sm text-[13px] text-ink-500">
        {checked > 0
          ? `${checked} pharmac${checked === 1 ? 'y' : 'ies'} in this ring confirmed they are out of stock.`
          : 'No pharmacy in this ring carries this medicine.'}
      </p>
    </div>
  );
}

function ExhaustedState({ medicineName }: { medicineName: string }) {
  return (
    <div className="rounded-soft border border-crit-400/40 bg-crit-100/50 px-4 py-4">
      <p className="flex items-center gap-2 text-[14px] font-semibold text-crit-700">
        <SupportIcon className="size-4" />
        Network exhausted at 50 km
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
        No pharmacy in the MEDYX network currently reports{' '}
        {medicineName || 'this medicine'} in stock. Rescue Support can help
        secure a unit through pre-funded supply for eligible patients.
      </p>
      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-capsule action-fill px-4 py-2 text-[13px] font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          style={{ boxShadow: '0 6px 18px rgba(18,180,119,0.24)' }}
        >
          <SupportIcon className="size-4" />
          Check Rescue Support
        </button>
        <span className="text-[11px] text-ink-400">
          Eligibility flow arrives in a later phase
        </span>
      </div>
    </div>
  );
}
