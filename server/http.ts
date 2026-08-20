/**
 * MEDYX — HTTP helpers.
 * Small shims so the route handlers stay readable without a framework.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import * as cookie from 'cookie';
import { config } from './config.js';

export interface Ctx {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  body: unknown;
  cookies: Record<string, string | undefined>;
}

const MAX_BODY_BYTES = 64 * 1024;

export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

export function sendJson(res: ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

export function setSessionCookie(res: ServerResponse, token: string, expiresAt: Date) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(config.sessionCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction,
      path: '/',
      expires: expiresAt,
    }),
  );
}

export function clearSessionCookie(res: ServerResponse) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(config.sessionCookieName, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction,
      path: '/',
      maxAge: 0,
    }),
  );
}

export function parseCookies(req: IncomingMessage): Record<string, string | undefined> {
  return cookie.parse(req.headers.cookie ?? '');
}

export function clientIp(req: IncomingMessage): string | undefined {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0]?.trim();
  return req.socket.remoteAddress ?? undefined;
}
