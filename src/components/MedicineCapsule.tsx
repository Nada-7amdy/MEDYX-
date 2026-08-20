import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CAPSULE_SPRING,
  EXPAND_SPRING,
  INTERACTION_MOTION,
  STATUS_COPY,
  STATUS_THEME,
  type CapsuleInteraction,
  type CapsuleStatus,
} from '../design/capsuleStates';
import { ChevronIcon } from './Icons';

export interface MedicineCapsuleProps {
  title: string;
  tagline?: string;
  status?: CapsuleStatus;
  /** Overrides the default status word ("In stock", "Shortage", ...). */
  statusLabel?: string;
  icon?: ReactNode;
  metric?: { value: string; caption: string };
  /** Controlled expansion. Omit for self-managed expansion. */
  expanded?: boolean;
  onToggle?: (next: boolean) => void;
  /** Renders the loading treatment (shimmer + pulsing ring). */
  loading?: boolean;
  /** Content revealed when the capsule expands into its feature interface. */
  children?: ReactNode;
  /** Hero capsule: larger type, stronger presence. */
  size?: 'md' | 'lg';
  /** Disables expansion — capsule becomes a plain readout. */
  static?: boolean;
  className?: string;
}

export function MedicineCapsule({
  title,
  tagline,
  status = 'neutral',
  statusLabel,
  icon,
  metric,
  expanded: controlledExpanded,
  onToggle,
  loading = false,
  children,
  size = 'md',
  static: isStatic = false,
  className = '',
}: MedicineCapsuleProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const panelId = useId();

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : uncontrolledExpanded;
  const expandable = !isStatic && Boolean(children);

  const theme = STATUS_THEME[status];

  // Resolve the single active interaction state.
  const interaction: CapsuleInteraction = loading
    ? 'loading'
    : expanded
      ? 'expanded'
      : pressed
        ? 'active'
        : hovered
          ? 'hover'
          : 'idle';

  const motionTarget = INTERACTION_MOTION[interaction];
  const lifted = interaction === 'hover' || interaction === 'active';

  function toggle() {
    if (!expandable) return;
    const next = !expanded;
    if (!isControlled) setUncontrolledExpanded(next);
    onToggle?.(next);
  }

  const isLarge = size === 'lg';

  return (
    <motion.div
      layout
      data-capsule
      data-interaction={interaction}
      data-status={status}
      animate={{ scale: motionTarget.scale, y: motionTarget.y }}
      transition={CAPSULE_SPRING}
      style={{
        boxShadow: lifted || expanded ? theme.glow : undefined,
        borderRadius: expanded ? 28 : 999,
      }}
      className={[
        // min-w-0 lets the capsule shrink inside grid/flex parents instead of
        // being forced wide by its tagline (grid items default to min-width:auto).
        'relative isolate min-w-0 bg-linear-160',
        theme.wash,
        'border',
        lifted || expanded ? theme.borderActive : theme.border,
        'shadow-soft transition-colors duration-300',
        expanded ? 'rounded-panel' : 'rounded-capsule',
        className,
      ].join(' ')}
    >
      {/* Loading shimmer — a thin sweep, not a skeleton block. */}
      {loading && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          <span
            className="animate-shimmer absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                'linear-gradient(100deg, transparent 30%, var(--md-shimmer) 50%, transparent 70%)',
              backgroundSize: '180% 100%',
            }}
          />
        </span>
      )}

      {/* ---------------- Capsule head ---------------- */}
      <motion.button
        layout="position"
        type="button"
        onClick={toggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        disabled={!expandable}
        aria-expanded={expandable ? expanded : undefined}
        aria-controls={expandable ? panelId : undefined}
        className={[
          'relative flex w-full items-center gap-3 text-left sm:gap-4',
          isLarge ? 'px-5 py-4 sm:px-7 sm:py-6' : 'px-4 py-3.5 sm:px-5 sm:py-4',
          expandable ? 'cursor-pointer' : 'cursor-default',
        ].join(' ')}
      >
        {/* Status dot + pulse ring */}
        <span className="relative flex shrink-0 items-center justify-center">
          <span
            className={[
              'relative z-10 flex items-center justify-center rounded-full',
              isLarge ? 'size-11 sm:size-12' : 'size-9 sm:size-10',
              'bg-paper ring-1 ring-inset',
              status === 'success'
                ? 'ring-medic-200'
                : status === 'warning'
                  ? 'ring-warn-400/40'
                  : status === 'critical'
                    ? 'ring-crit-400/40'
                    : 'ring-ice-300',
              theme.ring,
            ].join(' ')}
          >
            {icon ?? <span className={`size-2 rounded-full ${theme.dot}`} />}
          </span>

          {(loading || status === 'success') && (
            <span
              aria-hidden
              className={[
                'animate-pulse-ring absolute inset-0 rounded-full',
                status === 'success' ? 'bg-neon-400/35' : 'bg-cyan-300/35',
              ].join(' ')}
            />
          )}
        </span>

        {/* Title + tagline */}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={[
                'font-semibold tracking-tight text-ink-900',
                isLarge ? 'text-lg sm:text-2xl' : 'text-[15px] sm:text-base',
              ].join(' ')}
            >
              {title}
            </span>
            <span
              className={[
                'rounded-capsule px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase',
                theme.chip,
              ].join(' ')}
            >
              {loading ? 'Searching' : (statusLabel ?? STATUS_COPY[status])}
            </span>
          </span>

          {tagline && (
            <span
              className={[
                'mt-0.5 block truncate text-ink-500',
                isLarge ? 'text-sm sm:text-[15px]' : 'text-xs sm:text-[13px]',
                expanded ? 'whitespace-normal' : '',
              ].join(' ')}
            >
              {tagline}
            </span>
          )}
        </span>

        {/* Metric */}
        {metric && !expanded && (
          <span className="hidden shrink-0 text-right sm:block">
            <span
              className={`block font-mono text-sm font-semibold ${theme.label}`}
            >
              {metric.value}
            </span>
            <span className="block text-[10px] tracking-wide text-ink-400 uppercase">
              {metric.caption}
            </span>
          </span>
        )}

        {/* Expand affordance */}
        {expandable && (
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={CAPSULE_SPRING}
            className={[
              'flex shrink-0 items-center justify-center rounded-full border border-ice-300 bg-paper/80 text-ink-500',
              isLarge ? 'size-9' : 'size-8',
            ].join(' ')}
          >
            <ChevronIcon className="size-4" />
          </motion.span>
        )}
      </motion.button>

      {/* ---------------- Expanded feature interface ---------------- */}
      <AnimatePresence initial={false}>
        {expanded && children && (
          <motion.div
            key="panel"
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={EXPAND_SPRING}
            className="overflow-hidden"
          >
            <div
              className={[
                'border-t border-ice-200/90',
                isLarge ? 'px-5 pt-5 pb-6 sm:px-7' : 'px-4 pt-4 pb-5 sm:px-5',
              ].join(' ')}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
