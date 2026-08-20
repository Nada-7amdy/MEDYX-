/**
 * MEDYX — authentication service.
 *
 * Business logic only. Knows about the database, knows nothing about HTTP.
 * This is the seam that keeps auth decoupled from the capsule UI.
 */
import { withTransaction, query } from '../db/pool.js';
import { DUMMY_HASH, hashPassword, verifyPassword } from './password.js';
import type { SessionUser } from './session.js';
import type { LoginInput, Role, SignupInput } from './validation.js';

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly field?: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/** Shapes a DB row into the public user object. Never includes password_hash. */
function toPublicUser(row: {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  created_at: Date;
}): Omit<SessionUser, 'pharmacy'> {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at.toISOString(),
  };
}

export async function signup(input: SignupInput): Promise<SessionUser> {
  const passwordHash = await hashPassword(input.password);

  return withTransaction(async (client) => {
    const existing = await client.query('SELECT 1 FROM users WHERE lower(email) = $1', [
      input.email,
    ]);
    if (existing.rowCount) {
      throw new AuthError('An account with this email already exists', 409, 'email');
    }

    const { rows } = await client.query<{
      id: string;
      full_name: string;
      email: string;
      phone: string | null;
      role: Role;
      created_at: Date;
    }>(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone, role, created_at`,
      [input.fullName, input.email, input.phone, passwordHash, input.role],
    );
    const user = rows[0];

    let pharmacy: SessionUser['pharmacy'] = null;
    if (input.role === 'pharmacy') {
      const pharmacyRows = await client.query<{
        id: string;
        name: string;
        address: string;
        phone: string | null;
        verified: boolean;
      }>(
        `INSERT INTO pharmacies (owner_user_id, name, phone, address)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, address, phone, verified`,
        [user.id, input.pharmacyName, input.phone, input.address],
      );
      pharmacy = pharmacyRows.rows[0] ?? null;
    }

    return { ...toPublicUser(user), pharmacy };
  });
}

export async function login(input: LoginInput): Promise<SessionUser> {
  const { rows } = await query<{
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: Role;
    created_at: Date;
    password_hash: string;
    pharmacy_id: string | null;
    pharmacy_name: string | null;
    pharmacy_address: string | null;
    pharmacy_phone: string | null;
    pharmacy_verified: boolean | null;
  }>(
    `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.created_at, u.password_hash,
            p.id AS pharmacy_id, p.name AS pharmacy_name, p.address AS pharmacy_address,
            p.phone AS pharmacy_phone, p.verified AS pharmacy_verified
       FROM users u
       LEFT JOIN pharmacies p ON p.owner_user_id = u.id
      WHERE lower(u.email) = $1
      LIMIT 1`,
    [input.email],
  );

  const row = rows[0];

  // Always run a verification so response timing does not reveal whether the
  // account exists.
  const ok = row
    ? await verifyPassword(row.password_hash, input.password)
    : (await verifyPassword(DUMMY_HASH, input.password), false);

  if (!row || !ok) {
    throw new AuthError('Incorrect email or password', 401, 'form');
  }

  if (input.expectedRole && row.role !== input.expectedRole) {
    throw new AuthError(
      `This account is registered as ${row.role}. Switch role and try again.`,
      403,
      'form',
    );
  }

  return {
    ...toPublicUser(row),
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
