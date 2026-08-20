/**
 * MEDYX — API server.
 * Plain node:http so the auth foundation carries no framework baggage.
 */
import { createServer } from 'node:http';
import { config } from './config.js';
import { handleAuthRoute } from './auth/routes.js';
import { purgeExpiredSessions } from './auth/session.js';
import { sendJson } from './http.js';
import { pool } from './db/pool.js';
import { createStaticHandler } from './static.js';
import { resolve } from 'node:path';

// When a production build exists, this process also serves the SPA so the app
// and API share one origin.
const serveStatic = createStaticHandler(resolve(process.cwd(), 'dist'));

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  // The Vite dev server proxies /api and /auth, so same-origin applies and no
  // permissive CORS is needed. Answer preflight defensively anyway.
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { Allow: 'GET,POST,OPTIONS' });
    res.end();
    return;
  }

  try {
    if (url.pathname === '/api/health') {
      const { rows } = await pool.query('SELECT now() AS now');
      sendJson(res, 200, { ok: true, db: 'up', now: rows[0].now });
      return;
    }

    if (await handleAuthRoute(req, res, url.pathname)) return;

    // Anything else: try the built frontend (SPA fallback included).
    if ((req.method === 'GET' || req.method === 'HEAD') && serveStatic(url.pathname, res)) {
      return;
    }

    sendJson(res, 404, { error: `No route for ${req.method} ${url.pathname}` });
  } catch (err) {
    console.error('[server] unhandled:', err);
    if (!res.headersSent) sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(config.port, '0.0.0.0', () => {
  console.log(`[medyx-api] listening on http://0.0.0.0:${config.port}`);
});

// Periodic session housekeeping.
setInterval(
  () => {
    purgeExpiredSessions()
      .then((n) => n > 0 && console.log(`[medyx-api] purged ${n} expired session(s)`))
      .catch((e) => console.error('[medyx-api] purge failed:', e.message));
  },
  60 * 60 * 1000,
).unref();

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => pool.end().then(() => process.exit(0)));
  });
}
