// Serves the repo from a throwaway local port for tests that need an http origin
// (service workers and sync never run from file://).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

export function serveRepo({ prefix = '/' } = {}) {
  const root = path.resolve('.');
  const server = http.createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (!urlPath.startsWith(prefix)) return res.writeHead(404).end();
    const file = path.join(root, urlPath.slice(prefix.length) || 'index.html');
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    try {
      if (server.failPaths?.some(part => urlPath.endsWith(part))) return res.writeHead(503).end();
      let body = await readFile(file);
      if (file.endsWith('/sw.js') && server.revision) body = Buffer.from(body.toString().replace("GENERATION = 'v2'", "GENERATION = 'v" + server.revision + "'"));
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' }).end(body);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

export function stopServer(server) {
  server.closeAllConnections();
  return new Promise(resolve => server.close(resolve));
}
