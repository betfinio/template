/**
 * The Module Federation `shared` singleton contract.
 *
 * For a federated remote to work, the packages it shares with the host must
 * resolve to a SINGLE runtime instance — otherwise you get two Reacts (hooks
 * crash), two query caches, two wallet contexts, etc. This map declares which
 * packages are singletons; the host declares the same, and at runtime MF
 * negotiates one shared copy.
 *
 * Only include packages that carry cross-boundary React context or singleton
 * state. Everything else (icons, utils, your own components) is bundled per-app
 * and needs no entry here.
 *
 * IMPORTANT: keep the versions of these packages compatible with the host's
 * (see package.json). With `singleton: true`, a hard mismatch logs a warning and
 * MF falls back to one instance (the host's, because the host loads first) — but
 * matching majors avoids surprises. This template mirrors the reference host:
 * react 19, wagmi 3, @tanstack/react-query 5, react-i18next 15.
 */
export const mfShared = {
	react: { singleton: true },
	// JSX runtimes are stateless. Non-singleton keeps their `jsx`/`jsxs` exports
	// synchronous in a standalone build while elements still use the shared React.
	'react/jsx-runtime': { singleton: false },
	'react/jsx-dev-runtime': { singleton: false },
	'react-dom': { singleton: true },
	// Wallet state. The exposed page calls wagmi hooks (`useAccount`, …) directly;
	// sharing wagmi means those read the HOST's wallet connection at runtime —
	// no dependency on the host's private wallet package required.
	wagmi: { singleton: true },
	// One query cache shared with the host.
	'@tanstack/react-query': { singleton: true },
	// I18nextProvider context. The remote ships its own i18next INSTANCE (exposed
	// as `./i18n`); sharing `react-i18next` lets the host mount that instance and
	// have `useTranslation()` inside the page resolve to it.
	'react-i18next': { singleton: true },
	// If your host also shares the router and your exposed page uses router hooks
	// or <Link>, add it so they resolve to the host's router:
	// '@tanstack/react-router': { singleton: true },
} as const;

/** Remote-only apps preload their local shares before their standalone entry. */
export const mfRemoteShareStrategy = 'version-first' as const;
