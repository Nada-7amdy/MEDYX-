/**
 * MEDYX — authentication routes.
 *
 *   POST /auth/signup
 *   POST /auth/login
 *   POST /auth/logout
 *   GET  /auth/me
 *   GET  /auth/protected/:role   (role-based authorization demo)
 *
 * Handlers translate HTTP <-> service calls. No business logic lives here.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ZodError } from 'zod';
import { AuthError, login, signup } from './service.js';
import {
  createSession,
  resolveSession,
  revokeSession,
  type SessionUser,
} from './session.js';
import { fieldErrors, loginSchema, signupSchema } from './validation.js';
import type { Role } from './validation.js';
import {
  clearSessionCookie,
  clientIp,
  parseCookies,
  readJsonBody,
  sendJson,
  setSessionCookie,
} from '../http.js';
import { config } from '../config.js';

/** Naive in-memory rate limiter — enough to blunt credential stuffing in dev. */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function currentToken(req: IncomingMessage): string | undefined {
  return parseCookies(req)[config.sessionCookieName];
}

/** Guard used by protected routes. */
export async function requireUser(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<SessionUser | null> {
  const user = await resolveSession(currentToken(req));
  if (!user) {
    sendJson(res, 401, { error: 'Authentication required' });
    return null;
  }
  return user;
}

/** Guard with role-based authorization. */
export async function requireRole(
  req: IncomingMessage,
  res: ServerResponse,
  allowed: Role[],
): Promise<SessionUser | null> {
  const user = await resolveSession(currentToken(req));
  if (!user) {
    sendJson(res, 401, { error: 'Authentication required' });
    return null;
  }
  if (!allowed.includes(user.role)) {
    sendJson(res, 403, {
      error: `This area requires one of: ${allowed.join(', ')}`,
      role: user.role,
    });
    return null;
  }
  return user;
}

export async function handleAuthRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<boolean> {
  const method = req.method ?? 'GET';

  // ---------------------------------------------------------------- signup
  if (pathname === '/auth/signup' && method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const input = signupSchema.parse(body);
      const user = await signup(input);
      const { token, expiresAt } = await createSession(user.id, {
        userAgent: req.headers['user-agent'],
        ip: clientIp(req),
      });
      setSessionCookie(res, token, expiresAt);
      sendJson(res, 201, { user });
    } catch (err) {
      sendAuthError(res, err);
    }
    return true;
  }

  // ----------------------------------------------------------------- login
  if (pathname === '/auth/login' && method === 'POST') {
    try {
      const ip = clientIp(req) ?? 'unknown';
      if (rateLimited(`login:${ip}`)) {
        sendJson(res, 429, { error: 'Too many attempts. Try again in a minute.' });
        return true;
      }
      const body = await readJsonBody(req);
      const input = loginSchema.parse(body);
      const user = await login(input);
      const { token, expiresAt } = await createSession(user.id, {
        userAgent: req.headers['user-agent'],
        ip: clientIp(req),
      });
      setSessionCookie(res, token, expiresAt);
      sendJson(res, 200, { user });
    } catch (err) {
      sendAuthError(res, err);
    }
    return true;
  }

  // ---------------------------------------------------------------- logout
  if (pathname === '/auth/logout' && method === 'POST') {
    await revokeSession(currentToken(req));
    clearSessionCookie(res);
    sendJson(res, 200, { ok: true });
    return true;
  }

  // -------------------------------------------------------------------- me
  if (pathname === '/auth/me' && method === 'GET') {
    const user = await resolveSession(currentToken(req));
    if (!user) {
      sendJson(res, 401, { user: null, error: 'Not authenticated' });
      return true;
    }
    sendJson(res, 200, { user });
    return true;
  }

  // ----------------------------------------- role-protected demo endpoints
  if (pathname === '/auth/protected/patient' && method === 'GET') {
    const user = await requireRole(req, res, ['patient', 'admin']);
    if (user) sendJson(res, 200, { ok: true, area: 'patient', user });
    return true;
  }

  if (pathname === '/auth/protected/pharmacy' && method === 'GET') {
    const user = await requireRole(req, res, ['pharmacy', 'admin']);
    if (user) sendJson(res, 200, { ok: true, area: 'pharmacy', user });
    return true;
  }

  return false;
}

function sendAuthError(res: ServerResponse, err: unknown) {
  if (err instanceof ZodError) {
    sendJson(res, 422, {
      error: 'Please check the highlighted fields',
      fields: fieldErrors(err),
    });
    return;
  }
  if (err instanceof AuthError) {
    sendJson(res, err.status, {
      error: err.message,
      fields: err.field ? { [err.field]: err.message } : undefined,
    });
    return;
  }
  console.error('[auth] unexpected error:', err);
  sendJson(res, 500, { error: 'Something went wrong. Please try again.' });
}
