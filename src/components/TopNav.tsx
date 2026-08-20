import { useEffect, useRef, useState } from 'react';
import { CapsuleMark, PinIcon, UserIcon } from './Icons';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../auth/AuthProvider';

/**
 * The single application header for the authenticated experience.
 *
 * Minimal by design: MEDYX / SUPPLY RESCUE · Near Me · Theme · Profile.
 * No sidebar, no history, no prescriptions, no compliance links.
 *
 * This is the ONLY header once signed in — the account controls that used to
 * live in AuthenticatedShell (theme toggle, sign out) are merged in here so
 * the product surface never shows two stacked bars.
 */
export function TopNav() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the account menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const firstName = user?.fullName?.split(' ')[0] ?? 'Account';

  return (
    <header className="glass-rail sticky top-0 z-50">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:h-18 sm:px-6"
      >
        {/* Brand */}
        <a
          href="#top"
          className="group flex items-center gap-2.5 sm:gap-3"
          aria-label="MEDYX Supply Rescue — home"
        >
          <span className="relative flex size-9 items-center justify-center rounded-capsule bg-linear-140 from-medic-500 to-cyan-500 text-white shadow-soft transition-transform duration-300 group-hover:scale-105 sm:size-10">
            <CapsuleMark className="size-5 sm:size-[22px]" />
            <span
              aria-hidden
              className="animate-pulse-ring absolute inset-0 rounded-capsule bg-neon-400/30"
            />
          </span>
          <span className="leading-none">
            <span className="block text-[15px] font-bold tracking-[0.14em] text-ink-900 sm:text-base">
              MEDYX
            </span>
            <span className="mt-1 block text-[9px] font-semibold tracking-[0.22em] text-medic-600 uppercase sm:text-[10px]">
              Supply Rescue
            </span>
          </span>
        </a>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <a
            href="#rescue-search"
            className="group hidden items-center gap-2 rounded-capsule border border-ice-300 bg-paper/85 px-3 py-2 text-[13px] font-semibold text-ink-700 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-600 hover:shadow-lift sm:inline-flex sm:px-4 sm:py-2.5"
          >
            <PinIcon className="size-4 text-cyan-500 transition-transform duration-300 group-hover:scale-110" />
            <span>Near Me</span>
          </a>

          <ThemeToggle />

          {/* Account */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              /* The name is visually hidden below `sm`, so the button would
                 otherwise have no accessible name on mobile. */
              aria-label={`Account menu for ${user?.fullName ?? 'your account'}`}
              className="flex items-center gap-2 rounded-capsule border border-ice-300 bg-paper/85 px-3 py-2 text-[13px] font-semibold text-ink-700 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-medic-300 hover:text-medic-700 hover:shadow-lift sm:px-4 sm:py-2.5"
            >
              <UserIcon className="size-4 text-ink-400" />
              <span className="hidden max-w-[10ch] truncate sm:inline">
                {firstName}
              </span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="Account"
                className="glass-panel absolute right-0 z-50 mt-2 w-60 rounded-soft p-2"
              >
                <div className="border-b border-ice-200 px-3 pt-1.5 pb-2.5">
                  <p className="truncate text-[13px] font-semibold text-ink-900">
                    {user?.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-ink-500">
                    {user?.email}
                  </p>
                  <span className="mt-2 inline-block rounded-capsule bg-medic-100 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-medic-800 uppercase">
                    {user?.role}
                  </span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    void logout();
                  }}
                  className="mt-1.5 w-full rounded-capsule px-3 py-2 text-left text-[13px] font-semibold text-ink-700 transition-colors duration-200 hover:bg-ice-200 hover:text-crit-700"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
