/**
 * MEDYX — application root.
 *
 * Auth foundation phase: the splash capsule is the entry point. Once a
 * session exists the user lands in their role experience.
 */
import { AnimatePresence, motion } from 'motion/react';
import { ThemeProvider } from './theme/ThemeProvider';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { SplashScreen } from './components/auth/SplashScreen';
import { AuthenticatedShell } from './components/auth/AuthenticatedShell';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}

function Root() {
  const { user, initialising } = useAuth();

  // Avoid a splash flash while the cookie session is being restored.
  if (initialising) return <Booting />;

  return (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AuthenticatedShell />
        </motion.div>
      ) : (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <SplashScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Booting() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center"
      style={{ background: 'var(--md-canvas)' }}
    >
      <span className="sr-only">Loading MEDYX</span>
      <span
        aria-hidden
        className="animate-pulse-dot h-10 w-20 rounded-capsule"
        style={{
          background: 'var(--md-capsule-shell)',
          boxShadow: '0 0 0 1px var(--md-border), 0 0 30px var(--md-glow)',
        }}
      />
    </div>
  );
}
