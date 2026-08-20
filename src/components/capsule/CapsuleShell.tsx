/**
 * MEDYX — CapsuleShell
 *
 * The reusable capsule *surface*. It knows nothing about authentication; it
 * only renders the medicine-capsule form language (pill silhouette, seam,
 * shell gradient, glow, highlight sweep) around arbitrary children.
 *
 * Reused later by: Rescue Search, Gemini AI, Stock Pulse, Shortage Radar,
 * Pharmacy Network, Rescue Support, Supply Intelligence.
 */
import type { CSSProperties, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

export type CapsuleTone = 'neutral' | 'accent' | 'aqua' | 'success' | 'danger';

const TONE_GLOW: Record<CapsuleTone, string> = {
  neutral: 'var(--md-glow-cyan)',
  accent: 'var(--md-glow)',
  aqua: 'var(--md-glow-cyan)',
  success: 'var(--md-glow)',
  danger: 'rgba(233, 79, 61, 0.28)',
};

export interface CapsuleShellProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: ReactNode;
  tone?: CapsuleTone;
  /** Glow strength multiplier. 0 disables the glow entirely. */
  glow?: number;
  /** Renders the horizontal seam where the capsule halves meet. */
  seam?: boolean;
  /** Animated internal highlight — used on hover. */
  highlight?: boolean;
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
}

export function CapsuleShell({
  children,
  tone = 'neutral',
  glow = 1,
  seam = false,
  highlight = false,
  radius = 999,
  className = '',
  style,
  ...rest
}: CapsuleShellProps) {
  return (
    <motion.div
      {...rest}
      style={{
        borderRadius: radius,
        background: 'var(--md-capsule-shell)',
        boxShadow:
          glow > 0
            ? `0 0 0 1px var(--md-border), var(--md-shadow), 0 0 ${40 * glow}px ${TONE_GLOW[tone]}`
            : `0 0 0 1px var(--md-border), var(--md-shadow)`,
        ...style,
      }}
      className={`relative isolate overflow-hidden ${className}`}
    >
      {/* Top gloss — gives the shell its rounded, physical read. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[45%] opacity-70"
        style={{
          background:
            'linear-gradient(to bottom, var(--md-gloss), transparent)',
          borderRadius: 'inherit',
        }}
      />

      {/* Moving internal highlight (hover micro-animation). */}
      {highlight && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/3"
          style={{
            background:
              'linear-gradient(100deg, transparent, var(--md-sweep), transparent)',
          }}
          initial={{ x: '-120%' }}
          animate={{ x: '340%' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      )}

      {/* Seam between the two capsule halves. */}
      {seam && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px -translate-y-1/2"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--md-border-strong), transparent)',
          }}
        />
      )}

      {children}
    </motion.div>
  );
}
