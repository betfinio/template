import path from 'node:path';
import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { mfRemoteShareStrategy, mfShared } from './mf.shared';

// The container name a host uses to reference this remote (`template/main`,
// `template/i18n`). Change it here when you rename the app — keep it in sync with
// the `remotes` key in the host manifest.
const REMOTE_NAME = 'template';

// Dev port for standalone `bun dev`. Also the origin baked into chunk/CSS URLs so
// a host on another port can load them cross-origin during local development.
const PORT = 5200;

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		federation({
			name: REMOTE_NAME,
			filename: 'remoteEntry.js',
			// Standalone remotes must initialize federation at the entry boundary so
			// shared peers (react-query, wagmi, …) receive a populated React singleton.
			hostInitInjectLocation: 'entry',
			// Emit `mf-manifest.json` so a host can register this remote by manifest URL.
			manifest: true,
			// The host declares remote types via ambient d.ts; MF's type extraction is
			// dead weight here (and its dev worker can crash under `--mode production`).
			dts: false,
			// The federated surface. `./main` is the page; `./i18n` is this remote's
			// isolated i18next instance. Add more pages here and route to them from the
			// host manifest — no host rebuild needed.
			exposes: {
				'./main': './src/pages/main.tsx',
				'./i18n': './src/i18n.ts',
			},
			shared: mfShared,
			shareStrategy: mfRemoteShareStrategy,
		}),
	],
	// Expose PUBLIC_* env vars to import.meta.env (mirrors the reference host).
	envPrefix: 'PUBLIC_',
	server: { host: '0.0.0.0', port: PORT, cors: true, origin: `http://localhost:${PORT}` },
	preview: { port: PORT, cors: true },
	// MF runtime uses top-level await — needs a modern output target.
	build: { target: 'esnext' },
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
