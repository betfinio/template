import path from 'node:path';
import { federation } from '@module-federation/vite';
import { mfRemoteShareStrategy, mfShared } from '@betfin/sdk/mf';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The container name a host uses to reference this remote (`template/main`,
// `template/i18n`). Keep it in sync with the `remotes` key in the host manifest.
const REMOTE_NAME = 'template';

// Dev port for standalone `bun dev`, and the origin baked into chunk/CSS URLs so
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
			// shared peers receive a populated React singleton.
			hostInitInjectLocation: 'entry',
			// Emit `mf-manifest.json` so a host can register this remote by manifest URL.
			manifest: true,
			dts: false,
			exposes: {
				'./main': './src/pages/main.tsx',
				'./i18n': './src/i18n.ts',
			},
			// The IDENTICAL shared map the host uses (from @betfin/sdk) — the platform
			// contract (@betfin/sdk) is a shared singleton, so `useWallet()` resolves
			// to the host's wallet. wagmi is NOT shared; this app reads chain data with
			// its own bundled viem.
			shared: mfShared,
			shareStrategy: mfRemoteShareStrategy,
		}),
	],
	envPrefix: 'PUBLIC_',
	// `@betfin/sdk/mock` is a pre-built package that imports wagmi; force Vite to
	// pre-bundle that whole chain as a unit so CJS deps (e.g. eventemitter3) get
	// consistent ESM-interop in standalone dev. (Not needed under federation — the
	// host provides the wallet and MockHost isn't loaded there.)
	optimizeDeps: {
		include: ['@betfin/sdk/mock', 'wagmi', 'wagmi/chains', 'wagmi/connectors', 'viem', '@tanstack/react-query'],
	},
	server: { host: '0.0.0.0', port: PORT, cors: true, origin: `http://localhost:${PORT}` },
	preview: { port: PORT, cors: true },
	build: { target: 'esnext' },
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
