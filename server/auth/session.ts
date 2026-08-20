/**
 * MEDYX — opaque session tokens.
 *
 * A 256-bit random token is sent to the browser in an HttpOnly cookie.
 * Only its SHA-256 hash is stored, so the sessions table cannot be replayed.
 */
import { createHash, randomBytes } from 'node:crypto';
import { config } from '../config.js';
import { query } from '../db/pool.js';
import type { Role } from './validation.js';

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  pharmacy: {
    id: string;
    name: string;
    address: string;
    phone: string | null;
    verified: boolean;
  } | null;
}

export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(
  userId: string,
  meta: { userAgent?: string; ip?: string } = {},
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + config.sessionTtlDays * 86_400_000);

  await query(
    `INSERT INTO sessions (user_id, token_hash, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, hashToken(token), meta.userAgent ?? null, meta.ip ?? null, expiresAt],
  );

  return { token, expiresAt };
}

/**
 * Resolves a raw cookie token to its user, or null when the session is
 * missing, expired or revoked. Never returns password_hash.
 */
export async function resolveSession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;

  const { rows } = await query<{
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: Role;
    created_at: Date;
    pharmacy_id: string | null;
    pharmacy_name: string | null;
    pharmacy_address: string | null;
    pharmacy_phone: string | null;
    pharmacy_verified: boolean | null;
  }>(
    `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.created_at,
            p.id      AS pharmacy_id,
            p.name    AS pharmacy_name,
            p.address AS pharmacy_address,
            p.phone   AS pharmacy_phone,
            p.verified AS pharmacy_verified
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN pharmacies p ON p.owner_user_id = u.id
      WHERE s.token_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > now()
      LIMIT 1`,
    [hashToken(token)],
  );

  const row = rows[0];
  if (!row) return null;

  // Touch last_seen_at without blocking the response.
  void query('UPDATE sessions SET last_seen_at = now() WHERE token_hash = $1', [
    hashToken(token),
  ]).catch(() => {});

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at.toISOString(),
    pharmacy: row.pharmacy_id
      ? {
          id: row.pharmacy_id,
          name: row.pharmacy_name!,
          address: row.pharmacy_address!,
          phone: row.pharmacy_phone,
          verified: Boolean(row.pharmacy_verified),
        }
      : null,
  };
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await query(
    'UPDATE sessions SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL',
    [hashToken(token)],
  );
}

/** Housekeeping: drop expired rows. */
export async function purgeExpiredSessions(): Promise<number> {
  const { rowCount } = await query('DELETE FROM sessions WHERE expires_at < now()');
  return rowCount ?? 0;
}
