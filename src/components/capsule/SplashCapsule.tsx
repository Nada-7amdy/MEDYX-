/**
 * MEDYX — SplashCapsule
 *
 * The single large medicine capsule at the centre of the splash screen.
 * Closed it is one object; opened it splits into a Patient half and a
 * Pharmacy half that stay visually joined by the shell and seam.
 *
 * This component renders *presentation only*. Every decision (which phase,
 * which role, what happens on submit) is passed in — the capsule never calls
 * the auth API itself.
 */
import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CapsuleShell } from './CapsuleShell';
import type { AuthRole, CapsulePhase } from '../../auth/capsuleMachine';
import { isOpenPhase } from '../../auth/capsuleMachine';
import { useTheme } from '../../theme/ThemeProvider';

interface SplashCapsuleProps {
  phase: CapsulePhase;
  role: AuthRole | null;
  onOpen: () => void;
  onSelectRole: (role: AuthRole) => void;
  /** The authentication form, rendered inside the opened capsule. */
  children?: ReactNode;
}

const ROLE_COPY: Record<AuthRole, { title: string; blurb: string }> = {
  patient: { title: 'Patient', blurb: 'Find and access your medicines' },
  pharmacy: { title: 'Pharmacy', blurb: 'Manage medicine availability' },
};

export function SplashCapsule({
  phase,
  role,
  onOpen,
  onSelectRole,
  children,
}: SplashCapsuleProps) {
  const { reducedMotion } = useTheme();
  const [hovered, setHovered] = useState(false);

  const open = isOpenPhase(phase);
  const hasForm = Boolean(children);
  const closing = phase === 'CLOSING';
  const authenticating = phase === 'AUTHENTICATING';
  const success = phase === 'SUCCESS';
  const errored = phase === 'ERROR';

  const tone = success
    ? 'success'
    : errored
      ? 'danger'
      : authenticating
        ? 'aqua'
        : 'accent';

  const spring = reducedMotion
    ? { duration: 0.001 }
    : { type: 'spring' as const, stiffness: 220, damping: 28, mass: 0.9 };

  /* ----------------------------- CLOSED ----------------------------- */
  if (!open) {
    return (
      <motion.button
        type="button"
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label="Open MEDYX — choose Patient or Pharmacy to sign in"
        className="group relative block cursor-pointer rounded-capsule focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--md-accent)]"
        animate={
          reducedMotion
            ? {}
            : {
                scale: hovered ? 1.035 : 1,
                // Idle drift is kept to 3px: enough to read as "alive",
                // small enough that it never becomes a moving click target.
                y: hovered ? -10 : [0, -3, 0],
              }
        }
        transition={
          reducedMotion
            ? { duration: 0.001 }
            : hovered
              ? { type: 'spring', stiffness: 300, damping: 20 }
              : { y: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }
        }
      >
        <CapsuleShell
          tone="accent"
          glow={hovered ? 1.9 : 1}
          seam
          highlight={hovered && !reducedMotion}
          className="flex h-[168px] w-[300px] items-center justify-center sm:h-[200px] sm:w-[360px]"
        >
          {/* The two coloured halves that hint at what is inside. */}
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, color-mix(in srgb, var(--md-accent) 16%, transparent) 0%, color-mix(in srgb, var(--md-accent) 5%, transparent) 49.9%, transparent 50%)',
            }}
          />
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--md-cyan) 16%, transparent) 0%, color-mix(in srgb, var(--md-cyan) 5%, transparent) 49.9%, transparent 50%)',
            }}
          />

          <span className="relative z-10 text-center">
            <span className="block text-[26px] font-bold tracking-[0.3em] text-[var(--md-text)] sm:text-[32px]">
              MEDYX
            </span>
            <span className="mt-2 block text-[10px] font-semibold tracking-[0.28em] text-[var(--md-accent)] uppercase sm:text-[11px]">
              Supply Rescue
            </span>
            <span className="mt-3 block text-[11px] text-[var(--md-text-muted)] sm:text-[12px]">
              Tap to begin
            </span>
          </span>
        </CapsuleShell>
      </motion.button>
    );
  }

  /* ------------------------- OPEN / SPLIT --------------------------- */
  return (
    <motion.div
      layout
      initial={false}
      animate={{
        scale: closing ? 0.9 : 1,
        opacity: closing ? 0 : 1,
      }}
      transition={spring}
      className="w-full max-w-[300px] sm:max-w-[560px] lg:max-w-[720px]"
    >
      <CapsuleShell
        tone={tone}
        glow={success ? 2.2 : errored ? 1.6 : 1.3}
        radius={hasForm ? 44 : 72}
        className="w-full transition-[border-radius] duration-500"
      >
        {/* Authenticating: a calm breathing sweep, never a spinner. */}
        {authenticating && !reducedMotion && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background:
                'linear-gradient(100deg, transparent 35%, color-mix(in srgb, var(--md-cyan) 26%, transparent) 50%, transparent 65%)',
              backgroundSize: '220% 100%',
            }}
            animate={{ backgroundPosition: ['160% 0', '-160% 0'] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Success wash. */}
        <AnimatePresence>
          {success && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--md-accent) 22%, transparent), transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 p-2.5 sm:p-3">
          <div className="mb-2 flex items-center justify-center gap-2 pt-1">
            <span className="text-[11px] font-bold tracking-[0.3em] text-[var(--md-text)]">
              MEDYX
            </span>
          </div>

          {/* Role halves — two halves of ONE pill, not two cards.
              Outer edges keep the capsule curve; the inner edges are flat
              where the two halves meet at the seam. */}
          <div className="grid gap-0 sm:grid-cols-2">
            {(['patient', 'pharmacy'] as const).map((r) => (
              <RoleHalf
                key={r}
                role={r}
                side={r === 'patient' ? 'left' : 'right'}
                selected={role === r}
                dimmed={role !== null && role !== r}
                interactive={phase === 'ROLE_SELECTION'}
                onSelect={() => onSelectRole(r)}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>

          {/* The form emerges from the selected half. */}
          <AnimatePresence initial={false}>
            {children && (
              <motion.div
                key="form"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reducedMotion ? { duration: 0.001 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-3">{children}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CapsuleShell>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

function RoleHalf({
  role,
  side,
  selected,
  dimmed,
  interactive,
  onSelect,
  reducedMotion,
}: {
  role: AuthRole;
  side: 'left' | 'right';
  selected: boolean;
  dimmed: boolean;
  interactive: boolean;
  onSelect: () => void;
  reducedMotion: boolean;
}) {
  const copy = ROLE_COPY[role];
  const accentVar = role === 'patient' ? 'var(--md-accent)' : 'var(--md-cyan)';

  // Capsule-half geometry: the outer end keeps the full pill curve, the inner
  // end is nearly flat so the two halves read as one split capsule.
  // A literal 999px on a tall, narrow (stacked) half collapses into a circle
  // and clips its own text. Using a percentage of the SHORT axis keeps a true
  // capsule end at any aspect ratio: 50% of the height, 22% of the width.
  const OUTER_X = '22%';
  const OUTER_Y = '50%';
  const INNER = '14px';
  // Side-by-side (sm+): curve the outer LEFT or RIGHT edge.
  const radius =
    side === 'left'
      ? `${OUTER_X} ${INNER} ${INNER} ${OUTER_X} / ${OUTER_Y} ${INNER} ${INNER} ${OUTER_Y}`
      : `${INNER} ${OUTER_X} ${OUTER_X} ${INNER} / ${INNER} ${OUTER_Y} ${OUTER_Y} ${INNER}`;
  // Stacked (mobile): curve the outer TOP or BOTTOM edge instead.
  // Stacked halves are wide and short, so a fixed curve reads better than a
  // percentage (which bows the long edge).
  const STACK_X = '64px';
  const STACK_Y = '52px';
  const radiusStacked =
    side === 'left'
      ? `${STACK_X} ${STACK_X} ${INNER} ${INNER} / ${STACK_Y} ${STACK_Y} ${INNER} ${INNER}`
      : `${INNER} ${INNER} ${STACK_X} ${STACK_X} / ${INNER} ${INNER} ${STACK_Y} ${STACK_Y}`;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${copy.title} — ${copy.blurb}`}
      animate={{
        opacity: dimmed ? 0.5 : 1,
        scale: reducedMotion ? 1 : selected ? 1.01 : 1,
      }}
      whileHover={reducedMotion || !interactive ? undefined : { scale: 1.03, y: -3 }}
      whileTap={reducedMotion ? undefined : { scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      className="role-half group relative overflow-hidden px-6 py-5 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--md-accent)] sm:px-7 sm:py-6"
      style={{
        ['--rad-stacked' as string]: radiusStacked,
        ['--rad-side' as string]: radius,
        background: selected
          ? `color-mix(in srgb, ${accentVar} 13%, var(--md-surface))`
          : 'var(--md-surface)',
        border: `1px solid ${selected ? accentVar : 'var(--md-border)'}`,
        boxShadow: selected
          ? `inset 0 0 30px color-mix(in srgb, ${accentVar} 12%, transparent), 0 0 24px color-mix(in srgb, ${accentVar} 22%, transparent)`
          : 'none',
      }}
    >
      {/* Tinted dose fill, strongest at the capsule's outer end. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(${side === 'left' ? 'to left' : 'to right'}, transparent 45%, color-mix(in srgb, ${accentVar} ${selected ? 22 : 12}%, transparent) 100%)`,
        }}
      />

      <span
        className="relative flex size-9 items-center justify-center rounded-full"
        style={{
          background: `color-mix(in srgb, ${accentVar} 16%, transparent)`,
          color: accentVar,
        }}
      >
        <span className="size-2.5 rounded-full" style={{ background: accentVar }} />
      </span>

      <span className="relative mt-3 block text-[15px] font-bold tracking-tight text-[var(--md-text)] sm:text-[17px]">
        {copy.title}
      </span>
      <span className="relative mt-0.5 block text-[12px] leading-snug text-[var(--md-text-soft)] sm:text-[13px]">
        {copy.blurb}
      </span>

      {selected && (
        <span
          aria-hidden
          className="absolute top-3 right-3 rounded-capsule px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] uppercase"
          style={{ background: accentVar, color: 'var(--md-canvas)' }}
        >
          Selected
        </span>
      )}
    </motion.button>
  );
}
