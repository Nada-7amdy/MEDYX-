import { motion } from 'motion/react';
import { MedicineCapsule } from './MedicineCapsule';
import { FEATURE_ICON } from './Icons';
import { STATUS_THEME } from '../design/capsuleStates';
import type { FeatureDef } from '../design/features';
import { CheckIcon } from './Icons';

/**
 * Binds a feature definition to the generic MedicineCapsule and supplies the
 * expanded "feature interface" body. Kept thin on purpose — real feature UIs
 * will replace the body in the next phase.
 */
export function FeatureCapsule({
  feature,
  expanded,
  onToggle,
  loading,
  statusLabel,
  metric,
  children,
}: {
  feature: FeatureDef;
  expanded: boolean;
  onToggle: (next: boolean) => void;
  loading?: boolean;
  /** Overrides the static chip when the feature is live (e.g. Rescue Search). */
  statusLabel?: string;
  metric?: { value: string; caption: string };
  /** Live feature interface. Falls back to the descriptive body when absent. */
  children?: React.ReactNode;
}) {
  const Icon = FEATURE_ICON[feature.id];

  return (
    <MedicineCapsule
      title={feature.title}
      tagline={feature.tagline}
      status={feature.status}
      statusLabel={statusLabel ?? feature.statusLabel}
      metric={metric ?? feature.metric}
      size={feature.primary ? 'lg' : 'md'}
      expanded={expanded}
      onToggle={onToggle}
      loading={loading}
      icon={<Icon className={feature.primary ? 'size-5' : 'size-[18px]'} />}
    >
      {children ?? (
        <FeatureBlurb feature={feature} />
      )}
    </MedicineCapsule>
  );
}

/** The default descriptive body used by features that have no live UI yet. */
function FeatureBlurb({ feature }: { feature: FeatureDef }) {
  const theme = STATUS_THEME[feature.status];
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-5 sm:gap-6">
        <p
          className={[
            'text-[14px] leading-relaxed text-ink-600',
            feature.primary ? 'sm:col-span-3' : 'sm:col-span-5',
          ].join(' ')}
        >
          {feature.detail}
        </p>

        <ul
          className={[
            'grid gap-2',
            feature.primary ? 'sm:col-span-2' : 'sm:col-span-5 sm:grid-cols-3',
          ].join(' ')}
        >
          {feature.points.map((point, i) => (
            <motion.li
              key={point}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i + 0.05, duration: 0.35 }}
              className="flex items-start gap-2.5 rounded-soft border border-ice-200 bg-paper/70 px-3 py-2.5"
            >
              <CheckIcon className={`mt-0.5 size-3.5 shrink-0 ${theme.ring}`} />
              <span className="text-[13px] leading-snug text-ink-600">{point}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-ice-200 pt-4">
        <button
          type="button"
          className="rounded-capsule action-fill px-4 py-2 text-[13px] font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          style={{ boxShadow: '0 6px 18px rgba(18,180,119,0.24)' }}
        >
          Open {feature.title}
        </button>
        <span className="text-[12px] text-ink-400">
          Interface arrives in the next build phase
        </span>
      </div>
    </>
  );
}
