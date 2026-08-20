/**
 * MEDYX — splash screen.
 *
 * Owns the capsule state machine and connects it to the auth service.
 * The capsule component stays purely visual; all wiring lives here.
 */
import { useCallback, useEffect, useReducer } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SplashCapsule } from '../capsule/SplashCapsule';
import { AuthForm, type AuthFormValues } from './AuthForm';
import { ThemeToggle } from '../ThemeToggle';
import { useAuth } from '../../auth/AuthProvider';
import { ApiError, type SignupPayload } from '../../auth/api';
import {
  capsuleReducer,
  initialCapsuleState,
  isFormPhase,
  type AuthRole,
} from '../../auth/capsuleMachine';
import { useTheme } from '../../theme/ThemeProvider';

const OPEN_MS = 620;
const SUCCESS_HOLD_MS = 950;
const CLOSE_MS = 620;

export function SplashScreen() {
  const [state, dispatch] = useReducer(capsuleReducer, initialCapsuleState);
  const { login, signup } = useAuth();
  const { reducedMotion } = useTheme();

  /* --- CLOSED → OPENING → ROLE_SELECTION --- */
  useEffect(() => {
    if (state.phase !== 'OPENING') return;
    const t = setTimeout(() => dispatch({ type: 'OPENED' }), reducedMotion ? 0 : OPEN_MS);
    return () => clearTimeout(t);
  }, [state.phase, reducedMotion]);

  /* --- SUCCESS → CLOSING → REDIRECT --- */
  useEffect(() => {
    if (state.phase !== 'SUCCESS') return;
    const t = setTimeout(
      () => dispatch({ type: 'CLOSE' }),
      reducedMotion ? 0 : SUCCESS_HOLD_MS,
    );
    return () => clearTimeout(t);
  }, [state.phase, reducedMotion]);

  useEffect(() => {
    if (state.phase !== 'CLOSING') return;
    const t = setTimeout(
      () => dispatch({ type: 'REDIRECT' }),
      reducedMotion ? 0 : CLOSE_MS,
    );
    return () => clearTimeout(t);
  }, [state.phase, reducedMotion]);

  const handleSubmit = useCallback(
    async (values: AuthFormValues) => {
      const role = state.role;
      if (!role) return;
      dispatch({ type: 'SUBMIT' });

      try {
        if (state.mode === 'login') {
          await login(values.email, values.password, role);
        } else {
          const payload: SignupPayload =
            role === 'patient'
              ? {
                  role: 'patient',
                  fullName: values.fullName,
                  email: values.email,
                  phone: values.phone,
                  password: values.password,
                  confirmPassword: values.confirmPassword,
                }
              : {
                  role: 'pharmacy',
                  fullName: values.fullName,
                  pharmacyName: values.pharmacyName,
                  address: values.address,
                  email: values.email,
                  phone: values.phone,
                  password: values.password,
                  confirmPassword: values.confirmPassword,
                };
          await signup(payload);
        }
        dispatch({ type: 'SUCCESS' });
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
        const fields = err instanceof ApiError ? err.fields : {};
        dispatch({ type: 'FAIL', error: message, fields });
      }
    },
    [state.role, state.mode, login, signup],
  );

  const selectRole = useCallback((role: AuthRole) => {
    dispatch({ type: 'SELECT_ROLE', role });
  }, []);

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-x-hidden"
      style={{ background: 'var(--md-canvas)' }}
    >
      <AmbientField />

      {/* Minimal top bar */}
      <header className="relative z-20 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
        <span className="text-[13px] font-bold tracking-[0.22em] text-[var(--md-text)]">
          MEDYX
        </span>
        <ThemeToggle />
      </header>

      {/* Centre stage */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-14 sm:px-6">
        <AnimatePresence mode="wait">
          {state.phase === 'CLOSED' && (
            <motion.div
              key="tagline"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0.001 : 0.5 }}
              className="mb-10 text-center"
            >
              <h1 className="text-[26px] leading-tight font-bold tracking-tight text-[var(--md-text)] sm:text-[36px]">
                Find the medicine.
                <br />
                <span style={{ color: 'var(--md-accent)' }}>Rescue the supply.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-[var(--md-text-soft)] sm:text-[15px]">
                Medicine availability and shortage intelligence.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <SplashCapsule
          phase={state.phase}
          role={state.role}
          onOpen={() => dispatch({ type: 'OPEN' })}
          onSelectRole={selectRole}
        >
          {isFormPhase(state.phase) && state.role ? (
            <AuthForm
              role={state.role}
              mode={state.mode}
              phase={state.phase}
              error={state.error}
              fieldErrors={state.fieldErrors}
              onModeChange={(mode) => dispatch({ type: 'SET_MODE', mode })}
              onSubmit={handleSubmit}
              onBack={() => dispatch({ type: 'BACK_TO_ROLES' })}
            />
          ) : null}
        </SplashCapsule>

        {/* Status line — keeps phases discoverable without hover */}
        <p
          aria-live="polite"
          className="mt-6 min-h-[18px] text-center text-[12px] text-[var(--md-text-muted)]"
        >
          {state.phase === 'ROLE_SELECTION' && 'Choose how you use MEDYX'}
          {state.phase === 'AUTHENTICATING' && 'Verifying your details…'}
          {state.phase === 'SUCCESS' && 'Authenticated — opening MEDYX'}
        </p>
      </main>

      <footer className="relative z-10 px-4 pb-6 text-center text-[11px] text-[var(--md-text-muted)] sm:px-8">
        MEDYX is not a government platform, not an insurance provider and not a
        diagnosis system.
      </footer>
    </div>
  );
}

/** Restrained ambient background — two soft blooms, no neon flood. */
function AmbientField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute -top-32 left-[-10%] size-[420px] rounded-full blur-[120px] sm:size-[560px]"
        style={{ background: 'color-mix(in srgb, var(--md-accent) 18%, transparent)' }}
      />
      <div
        className="absolute right-[-10%] bottom-[-15%] size-[400px] rounded-full blur-[120px] sm:size-[540px]"
        style={{ background: 'color-mix(in srgb, var(--md-cyan) 16%, transparent)' }}
      />
    </div>
  );
}
