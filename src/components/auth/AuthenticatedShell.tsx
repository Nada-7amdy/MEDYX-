/**
 * MEDYX — authenticated entry point.
 *
 * This is the handoff between the auth capsule and the product surface:
 *
 *   SplashScreen (auth) → AuthenticatedShell → MedyxHome
 *
 * It renders a short branded capsule transition, verifies the session against
 * the role-scoped protected route, then hands off to MedyxHome. A user who
 * returns with a valid cookie session sees only this brief transition before
 * landing on Home — never the auth capsule.
 *
 * It owns no product UI itself; everything after the handoff is MedyxHome.
 */
import { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../../auth/AuthProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { CapsuleShell } from '../capsule/CapsuleShell';

/**
 * The product surface is only ever needed once a session exists, so it is
 * split out of the initial bundle. It is prefetched during the handoff below,
 * which means the chunk is already in flight before Home is rendered — the
 * split costs the user nothing in perceived latency.
 */
const MedyxHome = lazy(() =>
  import('../MedyxHome').then((m) => ({ default: m.MedyxHome })),
);

/** How long the branded handoff is held before Home takes over. */
const HANDOFF_MS = 900;

export function AuthenticatedShell() {
  const { user } = useAuth();
  const { reducedMotion } = useTheme();
  const [handedOff, setHandedOff] = useState(false);

  // Confirm the role-scoped protected route really is authorised for this
  // session. Kept here (not in MedyxHome) so the product surface stays free of
  // auth concerns — the server re-checks every request regardless.
  useEffect(() => {
    if (!user) return;
    const area = user.role === 'pharmacy' ? 'pharmacy' : 'patient';
    void fetch(`/auth/protected/${area}`, { credentials: 'same-origin' });
  }, [user]);

  useEffect(() => {
    // Warm the Home chunk while the handoff capsule is on screen.
    const prefetch = import('../MedyxHome');

    if (reducedMotion) {
      // No artificial hold, but still wait for the chunk so the user never
      // sees a bare fallback.
      let cancelled = false;
      void prefetch.then(() => {
        if (!cancelled) setHandedOff(true);
      });
      return () => {
        cancelled = true;
      };
    }

    const t = setTimeout(() => setHandedOff(true), HANDOFF_MS);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  if (!user) return null;

  const firstName = user.fullName.split(' ')[0];
  const area = user.role === 'pharmacy' ? 'pharmacy' : 'medicine';

  return (
    <AnimatePresence mode="wait">
      {handedOff ? (
        <motion.div
          key="home"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.001 : 0.45 }}
        >
          {/* Same capsule as the handoff, so a slow chunk never flashes a
              different layout. */}
          <Suspense fallback={<Handoff firstName={firstName} area={area} />}>
            <MedyxHome />
          </Suspense>
        </motion.div>
      ) : (
        <motion.div
          key="handoff"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.35 }}
        >
          <Handoff firstName={firstName} area={area} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The branded transition capsule — also the Suspense fallback for Home. */
function Handoff({ firstName, area }: { firstName: string; area: string }) {
  return (
    <div
      className="flex min-h-dvh items-center justify-center px-4"
      style={{ background: 'var(--md-canvas)' }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        <CapsuleShell
          tone="accent"
          glow={1.1}
          radius={999}
          className="px-10 py-7 text-center sm:px-14 sm:py-8"
        >
          <p className="text-[11px] font-bold tracking-[0.28em] text-[var(--md-text-muted)] uppercase">
            MEDYX
          </p>
          <p className="mt-2 text-[19px] font-bold tracking-tight text-[var(--md-text)] sm:text-[22px]">
            Welcome, {firstName}
          </p>
          <p className="mt-1 text-[13px] text-[var(--md-text-soft)]">
            Opening your {area} workspace…
          </p>
        </CapsuleShell>
      </motion.div>
    </div>
  );
}
