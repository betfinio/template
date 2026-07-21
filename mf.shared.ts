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
	// One query cache shared with the host.
	'@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
	// NOTE ON WALLET: `wagmi` is intentionally NOT shared. This remote mounts its
	// OWN `WagmiProvider` (see src/pages/main.tsx + src/wagmi.ts) so its wallet card
	// works standalone AND federated, using a bundled wagmi that can't collide with
	// the host's. Sharing it would be wrong here: a host typically mounts its
	// WagmiProvider inside its OWN wallet package (wagmi + Privy), so the provider
	// lives on THAT wagmi instance, not the bare shared singleton — a remote reading
	// shared wagmi would find no provider ("WagmiProviderNotFoundError"). To read the
	// HOST's wallet instead of running your own, consume the host's wallet package as
	// a shared singleton, or a public wallet bridge it exposes — see the README.
	// I18nextProvider context. The remote ships its own i18next INSTANCE (exposed
	// as `./i18n`); sharing `react-i18next` lets the host mount that instance and
	// have `useTranslation()` inside the page resolve to it.
	'react-i18next': { singleton: true, requiredVersion: '^15.0.0' },
	// If your host also shares the router and your exposed page uses router hooks
	// or <Link>, add it so they resolve to the host's router:
	// '@tanstack/react-router': { singleton: true, requiredVersion: '^1.0.0' },
} as const;

/**
 * `loaded-first`, NOT `version-first`. The share strategy is applied per-remote
 * from the config that declared the share — so THIS remote's strategy decides how
 * it resolves its own `wagmi`/`react-query` imports at runtime.
 *
 * With `version-first`, the remote picks the HIGHEST version in the shared scope.
 * Since this repo may install a newer patch than the host (own lockfile), that
 * would be the remote's OWN copy — a different instance than the one the host's
 * providers mounted → `WagmiProviderNotFoundError`, duplicate query cache.
 *
 * `loaded-first` deterministically resolves to the version the host has ALREADY
 * loaded (its live singleton, whose providers are mounted), which is exactly what
 * a guest remote must do. It also matches the host's own strategy. In standalone
 * there's only the remote's own copy, so it's picked — no behavior change.
 */
export const mfRemoteShareStrategy = 'loaded-first' as const;
