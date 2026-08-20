/**
 * MEDYX — Capsule interaction + status model
 *
 * A capsule has two orthogonal dimensions:
 *
 *  1. INTERACTION state  — idle | hover | active | expanded | loading
 *     Driven by the user / component lifecycle.
 *
 *  2. STATUS tone        — neutral | success | warning | critical
 *     Driven by supply data (stock found, shortage risk, out of stock).
 *
 * Together they cover the 8 required states:
 * idle, hover, active, expanded, loading, success, warning, critical.
 */

export type CapsuleInteraction =
  | 'idle'
  | 'hover'
  | 'active'
  | 'expanded'
  | 'loading';

export type CapsuleStatus = 'neutral' | 'success' | 'warning' | 'critical';

export type CapsuleAccent = 'medic' | 'cyan' | 'neon';

/** Visual recipe applied to a capsule for a given status tone. */
export interface StatusTheme {
  /** Left indicator dot / pulse colour. */
  dot: string;
  /** Thin border in resting state. */
  border: string;
  /** Border once hovered / active. */
  borderActive: string;
  /** Soft tint layered over the white surface. */
  wash: string;
  /** Glow used on hover + active (subtle, never neon-flood). */
  glow: string;
  /** Text colour for the status label. */
  label: string;
  /** Small pill background behind the status label. */
  chip: string;
  /** Icon/accent ring colour. */
  ring: string;
}

export const STATUS_THEME: Record<CapsuleStatus, StatusTheme> = {
  neutral: {
    dot: 'bg-cyan-400',
    border: 'border-ice-300',
    borderActive: 'border-cyan-300',
    wash: 'from-paper to-ice-50',
    glow: '0 0 0 1px rgba(53,193,227,0.16), 0 18px 40px rgba(13,165,204,0.14)',
    label: 'text-ink-500',
    chip: 'bg-ice-200 text-ink-600',
    ring: 'text-cyan-500',
  },
  success: {
    dot: 'bg-neon-500',
    border: 'border-medic-200',
    borderActive: 'border-medic-300',
    wash: 'from-paper to-medic-50',
    glow: '0 0 0 1px rgba(34,234,127,0.22), 0 18px 40px rgba(18,180,119,0.18)',
    label: 'text-medic-700',
    chip: 'bg-medic-100 text-medic-800',
    ring: 'text-medic-500',
  },
  warning: {
    dot: 'bg-warn-400',
    border: 'border-warn-100',
    borderActive: 'border-warn-400',
    wash: 'from-paper to-warn-100',
    glow: '0 0 0 1px rgba(245,181,68,0.24), 0 18px 40px rgba(224,149,20,0.16)',
    label: 'text-warn-700',
    chip: 'bg-warn-100 text-warn-700',
    ring: 'text-warn-500',
  },
  critical: {
    dot: 'bg-crit-500',
    border: 'border-crit-100',
    borderActive: 'border-crit-400',
    wash: 'from-paper to-crit-100',
    glow: '0 0 0 1px rgba(233,79,61,0.24), 0 18px 40px rgba(233,79,61,0.18)',
    label: 'text-crit-700',
    chip: 'bg-crit-100 text-crit-700',
    ring: 'text-crit-500',
  },
};

/** Motion values per interaction state — hover slightly scales + glows. */
export const INTERACTION_MOTION: Record<
  CapsuleInteraction,
  { scale: number; y: number }
> = {
  idle: { scale: 1, y: 0 },
  hover: { scale: 1.022, y: -4 },
  active: { scale: 0.995, y: -1 },
  expanded: { scale: 1, y: 0 },
  loading: { scale: 1, y: 0 },
};

export const CAPSULE_SPRING = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
  mass: 0.8,
};

export const EXPAND_SPRING = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

/** Human-readable copy for each status tone. */
export const STATUS_COPY: Record<CapsuleStatus, string> = {
  neutral: 'Ready',
  success: 'In stock',
  warning: 'Low supply',
  critical: 'Shortage',
};
