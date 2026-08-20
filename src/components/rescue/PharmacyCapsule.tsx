import { MedicineCapsule } from '../MedicineCapsule';
import { PharmacyIcon, CheckIcon, PinIcon } from '../Icons';
import {
  formatDistance,
  formatUpdatedAgo,
  type AvailabilityResult,
} from '../../lib/rescueSearch';
import type { CapsuleStatus } from '../../design/capsuleStates';

/**
 * One pharmacy availability row, rendered with the Phase 1 capsule primitive.
 * Expanding reveals quantity, freshness, confidence and the pickup actions.
 */
export function PharmacyCapsule({
  result,
  expanded,
  onToggle,
}: {
  result: AvailabilityResult;
  expanded: boolean;
  onToggle: (next: boolean) => void;
}) {
  const { pharmacy, quantity, distanceKm, updatedMinutesAgo, confidence, priceEGP } =
    result;

  // Tone reflects how dependable this specific listing is.
  const status: CapsuleStatus =
    quantity >= 3 && confidence.level !== 'low'
      ? 'success'
      : quantity > 0
        ? 'warning'
        : 'critical';

  const statusLabel =
    quantity === 0
      ? 'Out of stock'
      : quantity < 3
        ? `${quantity} left`
        : `${quantity} in stock`;

  return (
    <MedicineCapsule
      title={pharmacy.name}
      tagline={`${pharmacy.district} · ${formatDistance(distanceKm)} · updated ${formatUpdatedAgo(updatedMinutesAgo)}`}
      status={status}
      statusLabel={statusLabel}
      icon={<PharmacyIcon className="size-[18px]" />}
      metric={{ value: formatDistance(distanceKm), caption: 'away' }}
      expanded={expanded}
      onToggle={onToggle}
    >
      {/* Availability facts */}
      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Fact label="Quantity" value={`${quantity}`} caption="units on shelf" />
        <Fact label="Distance" value={formatDistance(distanceKm)} caption={pharmacy.district} />
        <Fact
          label="Last updated"
          value={formatUpdatedAgo(updatedMinutesAgo)}
          caption="by the pharmacy"
        />
        <Fact
          label="Confidence"
          value={`${confidence.score}%`}
          caption={confidence.label}
          bar={confidence.score}
          level={confidence.level}
        />
      </dl>

      {/* Pharmacy meta */}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <PinIcon className="size-3.5 text-cyan-500" />
          {pharmacy.hours}
        </span>
        {pharmacy.verified && (
          <span className="inline-flex items-center gap-1.5 text-medic-700">
            <CheckIcon className="size-3.5" />
            Verified — confirms a hold before pickup
          </span>
        )}
        {pharmacy.delivery && <span>Delivery available</span>}
        <span className="font-mono text-ink-600">EGP {priceEGP}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-ice-200 pt-4">
        <button
          type="button"
          className="rounded-capsule action-fill px-4 py-2 text-[13px] font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          style={{ boxShadow: '0 6px 18px rgba(18,180,119,0.24)' }}
        >
          Reserve this unit
        </button>
        <button
          type="button"
          className="rounded-capsule border border-ice-300 bg-paper px-4 py-2 text-[13px] font-semibold text-ink-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-600"
        >
          Pharmacy details
        </button>
        <span className="text-[11px] text-ink-400">Demo — no real reservation is made</span>
      </div>
    </MedicineCapsule>
  );
}

function Fact({
  label,
  value,
  caption,
  bar,
  level,
}: {
  label: string;
  value: string;
  caption: string;
  bar?: number;
  level?: 'high' | 'medium' | 'low';
}) {
  return (
    <div className="rounded-soft border border-ice-200 bg-paper/75 px-3 py-2.5">
      <dt className="text-[10px] font-semibold tracking-[0.12em] text-ink-400 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-[15px] font-semibold text-ink-900">{value}</dd>
      {bar !== undefined && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ice-200">
          <div
            className={[
              'h-full rounded-full transition-all duration-500',
              level === 'high'
                ? 'bg-medic-500'
                : level === 'medium'
                  ? 'bg-warn-400'
                  : 'bg-crit-400',
            ].join(' ')}
            style={{ width: `${bar}%` }}
          />
        </div>
      )}
      <p className="mt-1 text-[11px] leading-snug text-ink-400">{caption}</p>
    </div>
  );
}
