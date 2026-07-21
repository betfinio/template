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
 * CRITICAL — `requiredVersion` floors. MF infers a singleton's requiredVersion
 * from the CONSUMER's *installed* version as `^<installed>`. Because this repo has
 * its OWN lockfile, it may install a newer PATCH than the host (e.g. wagmi 3.7.3
 * here vs 3.7.0 on the host). MF would then reject the host's older singleton and
 * fall back to this remote's own copy — which for wagmi means an unmounted
 * `WagmiContext` → "WagmiProviderNotFoundError", and for react-query a duplicate
 * cache. So we pin `requiredVersion` to a permissive MAJOR floor: the remote
 * accepts ANY compatible version the host provides, and always uses the host's
 * one instance. Bump a floor only when the host moves to a new major.
 * (In-monorepo remotes don't need this — they share the host's single lockfile.)
 */
export const mfShared = {
	react: { singleton: true, requiredVersion: '^19.0.0' },
	// JSX runtimes are stateless. Non-singleton keeps their `jsx`/`jsxs` exports
	// synchronous in a standalone build while elements still use the shared React.
	'react/jsx-runtime': { singleton: false, requiredVersion: '^19.0.0' },
	'react/jsx-dev-runtime': { singleton: false, requiredVersion: '^19.0.0' },
	'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
	// Wallet state. The exposed page calls wagmi hooks (`useAccount`, …) directly;
	// sharing wagmi means those read the HOST's wallet connection at runtime —
	// no dependency on the host's private wallet package required.
	wagmi: { singleton: true, requiredVersion: '^3.0.0' },
	// One query cache shared with the host.
	'@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
	// I18nextProvider context. The remote ships its own i18next INSTANCE (exposed
	// as `./i18n`); sharing `react-i18next` lets the host mount that instance and
	// have `useTranslation()` inside the page resolve to it.
	'react-i18next': { singleton: true, requiredVersion: '^15.0.0' },
	// If your host also shares the router and your exposed page uses router hooks
	// or <Link>, add it so they resolve to the host's router:
	// '@tanstack/react-router': { singleton: true, requiredVersion: '^1.0.0' },
} as const;

/** Remote-only apps preload their local shares before their standalone entry. */
export const mfRemoteShareStrategy = 'version-first' as const;
