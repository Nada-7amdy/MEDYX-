/**
 * MEDYX — password hashing.
 *
 * argon2id, the current OWASP recommendation for password storage.
 * The server-side pepper is supplied through argon2's native `secret`
 * parameter (keyed hashing), so a stolen database cannot be cracked without
 * also stealing the application secret.
 */
import argon2, { type HashOptions } from 'argon2';
import { config } from '../config.js';

const SECRET = Buffer.from(config.pepper, 'utf8');

const HASH_OPTIONS: HashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB — OWASP minimum
  timeCost: 2,
  parallelism: 1,
  secret: SECRET,
};

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, HASH_OPTIONS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain, { secret: SECRET });
  } catch {
    return false;
  }
}

/**
 * A hash of an unguessable value. Login verifies against this when the email
 * is unknown, so response timing does not reveal whether an account exists.
 */
export const DUMMY_HASH: string = await argon2.hash(
  'medyx-dummy-password-not-a-real-account',
  HASH_OPTIONS,
);
