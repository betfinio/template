import path from 'node:path';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { mfRemoteShareStrategy, mfShared } from '@betfin/sdk/mf';

// The container name a host uses to reference this remote (`template/main`,
// `template/i18n`). Keep it in sync with the `remotes` key in the host manifest.
const REMOTE_NAME = 'template';

// Dev port for standalone `bun dev`, and the origin baked into asset URLs so a
// host on another port can load this remote's chunks cross-origin during dev.
const PORT = 5200;
const ORIGIN = `http://localhost:${PORT}`;

// https://rsbuild.dev/config/
export default defineConfig({
	plugins: [
		pluginReact(),
		pluginModuleFederation({
			name: REMOTE_NAME,
			filename: 'remoteEntry.js',
			exposes: {
				'./main': './src/pages/main.tsx',
				'./i18n': './src/i18n.ts',
			},
			// The IDENTICAL shared map the host uses (from @betfin/sdk) — bundler-agnostic
			// MF config. `@betfin/sdk` is a shared singleton so `useWallet()` resolves to
			// the host's wallet. wagmi is NOT shared; this app reads chain data with viem.
			shared: mfShared,
			shareStrategy: mfRemoteShareStrategy,
			// Emit `mf-manifest.json` so a host can register this remote by manifest URL.
			manifest: true,
			dts: false,
		}),
	],
	source: {
		entry: { index: './src/main.tsx' },
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			// `@wagmi/core/tempo` has an optional `import('accounts')` (a graceful-fail,
			// turbopack-optional import). Vite/esbuild tolerate the unresolvable
			// specifier; Rspack tries to resolve it and errors. That connector path is
			// never invoked here (MockHost uses the injected connector), so stub it.
			accounts: false,
		},
	},
	// `class="dark"` on <html>, favicon, title live in index.html; Rsbuild injects
	// the bundled script/style tags into it.
	html: { template: './index.html' },
	server: {
		port: PORT,
		// Let a host on another origin fetch this remote's manifest/entry/chunks.
		headers: { 'Access-Control-Allow-Origin': '*' },
	},
	// Absolute asset URLs (dev + build) so the host loads chunks from this origin.
	dev: { assetPrefix: ORIGIN },
	output: { assetPrefix: ORIGIN },
});
