/**
 * MEDYX — runtime configuration.
 * All secrets come from environment variables; nothing is hard-coded and
 * nothing here is ever sent to the client.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Minimal .env loader (avoids an extra dependency). */
function loadEnvFile(path: string) {
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    return;
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), '.env'));

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  databaseUrl: required('DATABASE_URL'),
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'medyx_session',
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS ?? 7),
  /** Extra server-side secret mixed into password hashing. */
  pepper: required('AUTH_PEPPER'),
  port: Number(process.env.PORT ?? 8787),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  get isProduction() {
    return this.nodeEnv === 'production';
  },
} as const;
