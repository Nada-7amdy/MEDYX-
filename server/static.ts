/**
 * MEDYX — static file serving for the built frontend.
 *
 * In production (and in this sandbox) the API process also serves the compiled
 * SPA, so the browser talks to a single origin: no CORS, and the session
 * cookie is naturally same-origin.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import type { ServerResponse } from 'node:http';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

export function createStaticHandler(rootDir: string) {
  const root = resolve(rootDir);

  return function serveStatic(pathname: string, res: ServerResponse): boolean {
    if (!existsSync(root)) return false;

    // Resolve safely: never escape the dist directory.
    const rel = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
    let filePath = join(root, rel);
    if (!filePath.startsWith(root)) return false;

    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = join(filePath, 'index.html');
    }

    // SPA fallback: unknown paths return index.html.
    if (!existsSync(filePath)) {
      filePath = join(root, 'index.html');
      if (!existsSync(filePath)) return false;
    }

    const ext = extname(filePath);
    const isHashedAsset = /\/assets\//.test(filePath);

    res.writeHead(200, {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Cache-Control': isHashedAsset
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    createReadStream(filePath).pipe(res);
    return true;
  };
}
