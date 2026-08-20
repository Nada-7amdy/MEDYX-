/**
 * MEDYX — client-side route protection.
 *
 * A convenience guard only. The real enforcement is server-side: every
 * protected endpoint re-checks the session cookie and the user's role.
 */
import type { ReactNode } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import type { Role } from '../../auth/api';

export function ProtectedRoute({
  allow,
  children,
  fallback = null,
  loading = null,
}: {
  allow?: Role[];
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}) {
  const { user, initialising } = useAuth();

  if (initialising) return <>{loading}</>;
  if (!user) return <>{fallback}</>;
  if (allow && !allow.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
