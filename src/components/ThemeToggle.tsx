import { useTheme } from '../theme/ThemeProvider';

/** Light/dark toggle. Accessible, keyboard reachable, persists the choice. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle, preference } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode${
        preference === 'system' ? ' (currently following your system setting)' : ''
      }`}
      title={`${isDark ? 'Light' : 'Dark'} mode`}
      className={`inline-flex items-center gap-2 rounded-capsule border px-3 py-2 text-[12px] font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--md-accent)] ${className}`}
      style={{
        background: 'var(--md-surface)',
        borderColor: 'var(--md-border)',
        color: 'var(--md-text-soft)',
      }}
    >
      <span
        aria-hidden
        className="relative flex h-4 w-7 items-center rounded-full transition-colors duration-300"
        style={{ background: isDark ? 'var(--md-accent)' : 'var(--md-border-strong)' }}
      >
        <span
          className="absolute size-3 rounded-full bg-white transition-transform duration-300"
          style={{ transform: isDark ? 'translateX(14px)' : 'translateX(2px)' }}
        />
      </span>
      <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
