import { stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * Tiny static server for the built remote (`dist/`). A host loading this remote
 * cross-origin needs two things this server sets:
 *   - `Access-Control-Allow-Origin: *` on every response (CORS), and
 *   - `no-store` on `mf-manifest.json` / `remoteEntry.js` / `index.html`, so a
 *     redeploy is picked up immediately while hashed `assets/*` stay immutable.
 * Run after `bun run build`:  `PORT=5200 bun scripts/serve.ts`
 */
const root = path.resolve('dist');
const port = Number(process.env.PORT) || 5200;

function headersFor(filePath: string): Headers {
	const h = new Headers({ 'Access-Control-Allow-Origin': '*' });
	const base = path.basename(filePath);
	if (base === 'mf-manifest.json' || base === 'remoteEntry.js' || base === 'index.html') {
		h.set('Cache-Control', 'no-store, max-age=0');
	} else if (filePath.startsWith(path.join(root, 'assets') + path.sep)) {
		h.set('Cache-Control', 'public, max-age=31536000, immutable');
	} else {
		h.set('Cache-Control', 'no-cache');
	}
	return h;
}

async function isFile(p: string): Promise<boolean> {
	try {
		return (await stat(p)).isFile();
	} catch {
		return false;
	}
}

async function serveFile(filePath: string, method: string): Promise<Response> {
	const file = Bun.file(filePath);
	const headers = headersFor(filePath);
	if (file.type) headers.set('Content-Type', file.type);
	return new Response(method === 'HEAD' ? null : file, { headers });
}

Bun.serve({
	hostname: '0.0.0.0',
	port,
	async fetch(req) {
		const url = new URL(req.url);
		if (url.pathname === '/health') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
		if (req.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
					'Access-Control-Allow-Headers': '*',
				},
			});
		}
		const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
		const candidate = path.join(root, rel);
		if (rel && candidate.startsWith(root) && (await isFile(candidate))) {
			return serveFile(candidate, req.method);
		}
		// SPA fallback for standalone routes.
		return serveFile(path.join(root, 'index.html'), req.method);
	},
});

console.log(`Serving ${root} on http://0.0.0.0:${port}`);
