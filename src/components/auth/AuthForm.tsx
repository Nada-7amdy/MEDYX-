/**
 * MEDYX — authentication form.
 *
 * Pure presentation + local field state. It reports submissions upward; it
 * never talks to the API, so it can be reused wherever the capsule appears.
 */
import { useMemo, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import type { AuthRole, CapsulePhase } from '../../auth/capsuleMachine';

export interface AuthFormValues {
  fullName: string;
  pharmacyName: string;
  address: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const EMPTY: AuthFormValues = {
  fullName: '',
  pharmacyName: '',
  address: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export function AuthForm({
  role,
  mode,
  phase,
  error,
  fieldErrors,
  onModeChange,
  onSubmit,
  onBack,
}: {
  role: AuthRole;
  mode: 'login' | 'signup';
  phase: CapsulePhase;
  error: string | null;
  fieldErrors: Record<string, string>;
  onModeChange: (mode: 'login' | 'signup') => void;
  onSubmit: (values: AuthFormValues) => void;
  onBack: () => void;
}) {
  const [values, setValues] = useState<AuthFormValues>(EMPTY);
  const busy = phase === 'AUTHENTICATING';
  const done = phase === 'SUCCESS';

  const set = (key: keyof AuthFormValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const fields = useMemo(() => {
    if (mode === 'login') {
      return [
        { key: 'email' as const, label: 'Email', type: 'email', autoComplete: 'email' },
        {
          key: 'password' as const,
          label: 'Password',
          type: 'password',
          autoComplete: 'current-password',
        },
      ];
    }
    const shared = [
      { key: 'email' as const, label: 'Email', type: 'email', autoComplete: 'email' },
      { key: 'phone' as const, label: 'Phone', type: 'tel', autoComplete: 'tel' },
      {
        key: 'password' as const,
        label: 'Password',
        type: 'password',
        autoComplete: 'new-password',
      },
      {
        key: 'confirmPassword' as const,
        label: 'Confirm password',
        type: 'password',
        autoComplete: 'new-password',
      },
    ];
    return role === 'patient'
      ? [
          { key: 'fullName' as const, label: 'Full name', type: 'text', autoComplete: 'name' },
          ...shared,
        ]
      : [
          {
            key: 'pharmacyName' as const,
            label: 'Pharmacy name',
            type: 'text',
            autoComplete: 'organization',
          },
          {
            key: 'fullName' as const,
            label: 'Owner / manager name',
            type: 'text',
            autoComplete: 'name',
          },
          ...shared,
          {
            key: 'address' as const,
            label: 'Pharmacy address',
            type: 'text',
            autoComplete: 'street-address',
          },
        ];
  }, [mode, role]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy || done) return;
    onSubmit(values);
  }

  const roleLabel = role === 'patient' ? 'Patient' : 'Pharmacy';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[26px] border p-4 sm:p-5"
      style={{ background: 'var(--md-surface-2)', borderColor: 'var(--md-border)' }}
    >
      {/* Header: role is always visible */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="rounded-capsule px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] uppercase"
            style={{
              background:
                role === 'patient'
                  ? 'color-mix(in srgb, var(--md-accent) 18%, transparent)'
                  : 'color-mix(in srgb, var(--md-cyan) 18%, transparent)',
              color: role === 'patient' ? 'var(--md-accent)' : 'var(--md-cyan)',
            }}
          >
            {roleLabel}
          </span>
          <span className="text-[13px] font-semibold text-[var(--md-text)]">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </span>
        </div>

        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="rounded-capsule px-2.5 py-1 text-[12px] font-medium text-[var(--md-text-soft)] transition-colors hover:text-[var(--md-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--md-accent)] disabled:opacity-50"
        >
          ← Change role
        </button>
      </div>

      {/* Error — capsule stays open, form state preserved */}
      {error && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 rounded-[16px] border px-3.5 py-2.5 text-[13px]"
          style={{
            background: 'color-mix(in srgb, #e94f3d 12%, transparent)',
            borderColor: 'color-mix(in srgb, #e94f3d 40%, transparent)',
            color: '#e9695a',
          }}
        >
          {error}
        </motion.div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => {
          const fieldError = fieldErrors[f.key];
          const wide = f.key === 'address' || mode === 'login';
          return (
            <div key={f.key} className={wide ? 'sm:col-span-2' : ''}>
              <label
                htmlFor={`medyx-${f.key}`}
                className="mb-1 block text-[11px] font-semibold tracking-[0.06em] text-[var(--md-text-soft)] uppercase"
              >
                {f.label}
              </label>
              <input
                id={`medyx-${f.key}`}
                name={f.key}
                type={f.type}
                autoComplete={f.autoComplete}
                value={values[f.key]}
                onChange={set(f.key)}
                disabled={busy || done}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? `medyx-${f.key}-error` : undefined}
                className="w-full rounded-[14px] border px-3 py-2.5 text-[14px] text-[var(--md-text)] transition-colors focus:outline-none focus-visible:border-[var(--md-accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--md-accent)_35%,transparent)] disabled:opacity-60"
                style={{
                  background: 'var(--md-surface)',
                  borderColor: fieldError ? '#e94f3d' : 'var(--md-border)',
                }}
              />
              {fieldError && (
                <p
                  id={`medyx-${f.key}-error`}
                  className="mt-1 text-[11px]"
                  style={{ color: '#e9695a' }}
                >
                  {fieldError}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || done}
          className="relative inline-flex items-center gap-2 overflow-hidden rounded-capsule px-5 py-2.5 text-[14px] font-semibold transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--md-accent)] disabled:opacity-80"
          style={{
            background:
              done
                ? 'var(--md-accent)'
                : 'linear-gradient(140deg, var(--md-accent), color-mix(in srgb, var(--md-accent) 70%, #000))',
            color: '#04150f',
            boxShadow: '0 8px 22px color-mix(in srgb, var(--md-accent) 35%, transparent)',
          }}
        >
          {done
            ? 'Authenticated'
            : busy
              ? 'Verifying…'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
        </button>

        <button
          type="button"
          onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
          disabled={busy || done}
          className="text-[13px] font-medium text-[var(--md-text-soft)] underline-offset-4 transition-colors hover:text-[var(--md-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--md-accent)] disabled:opacity-50"
        >
          {mode === 'login'
            ? `New ${roleLabel.toLowerCase()}? Create an account`
            : 'Already registered? Sign in'}
        </button>
      </div>

      {mode === 'login' && (
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--md-text-muted)]">
          Demo accounts —{' '}
          <code className="font-mono">
            {role === 'patient' ? 'patient1@demo.medyx.test' : 'pharmacy1@demo.medyx.test'}
          </code>{' '}
          / <code className="font-mono">MedyxDemo123</code> (synthetic data)
        </p>
      )}
    </form>
  );
}
