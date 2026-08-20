import { motion } from 'motion/react';
import { RADIUS_STEPS, type RadiusStep } from '../../lib/rescueSearch';

/**
 * The Rescue Search radius visual: concentric rings that fill as the search
 * widens. Uses the existing ice/medic/cyan palette — no new design language.
 */
export function RadiusRings({
  radius,
  busy,
  found,
}: {
  radius: RadiusStep;
  busy: boolean;
  found: boolean;
}) {
  const activeIndex = RADIUS_STEPS.indexOf(radius);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[210px]">
      <svg viewBox="0 0 200 200" className="size-full overflow-visible">
        {RADIUS_STEPS.map((step, i) => {
          const r = 24 + i * 24;
          const reached = i <= activeIndex;
          const isActive = i === activeIndex;
          return (
            <g key={step}>
              <motion.circle
                cx="100"
                cy="100"
                r={r}
                fill={
                  reached
                    ? found && isActive
                      ? 'rgba(34,234,127,0.07)'
                      : 'rgba(53,193,227,0.05)'
                    : 'transparent'
                }
                stroke={
                  isActive
                    ? found
                      ? 'rgba(18,180,119,0.85)'
                      : 'rgba(13,165,204,0.8)'
                    : reached
                      ? 'rgba(120,216,240,0.7)'
                      : 'rgba(188,221,233,0.55)'
                }
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={reached ? undefined : '3 5'}
                initial={false}
                animate={{ opacity: reached ? 1 : 0.6 }}
                transition={{ duration: 0.4 }}
              />
              {/* Label only the active ring and the outer boundary, so the
                  inner rings stay legible at small sizes. */}
              {(isActive || i === RADIUS_STEPS.length - 1) && (
                <text
                  x="100"
                  y={100 - r - 5}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={isActive ? 10 : 9}
                  fill={
                    isActive ? (found ? '#077252' : '#0a83a6') : '#a8bec7'
                  }
                  fontWeight={isActive ? 700 : 500}
                >
                  {step}km
                </text>
              )}
            </g>
          );
        })}

        {/* Sweeping needle while a ring is being checked */}
        {busy && (
          <motion.line
            x1="100"
            y1="100"
            x2="100"
            y2="26"
            stroke="rgba(13,165,204,0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ originX: '100px', originY: '100px' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Origin */}
        <circle
          cx="100"
          cy="100"
          r="5"
          fill={found ? '#12b477' : '#0da5cc'}
          opacity="0.9"
        />
        <circle cx="100" cy="100" r="5" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>

      {busy && (
        <span
          aria-hidden
          className="animate-pulse-ring absolute inset-[38%] rounded-full bg-cyan-300/40"
        />
      )}
    </div>
  );
}
