# betfin-template

A **standalone [Module Federation](https://module-federation.io/) remote** template. It runs as its own app during development, then plugs into a host at runtime by adding a few lines to the host's JSON manifest — **no host rebuild**.

Built to match the Betfin host contract, but it depends on **public npm packages only** — no private workspace packages — so anyone can clone, build, and deploy it.

```
Rsbuild 2  ·  React 19  ·  Module Federation 2  ·  wagmi 3  ·  @tanstack/react-query 5  ·  react-i18next 15  ·  Tailwind v4
```

## Build with an AI coding agent

[![Use this template](https://img.shields.io/badge/1._Use_this-template-238636?style=for-the-badge&logo=github)](https://github.com/betfinio/template/generate)
[![Open in Codex](https://img.shields.io/badge/2._Open_in-Codex-111111?style=for-the-badge&logo=openai)](https://chatgpt.com/codex?prompt=Read%20AGENTS.md%20and%20README.md%20before%20changing%20code.%20Ask%20me%20what%20app%20to%20build%2C%20then%20implement%20it%20as%20a%20production-ready%20Betfin%20federated%20remote.%20Keep%20the%20public%20%40betfin%2Fsdk%20and%20%40betfin%2Fui%20integration%2C%20Module%20Federation%20manifest%20contract%2C%20i18n%2C%20CSS%20isolation%2C%20and%20verification%20gates%20intact.)
[![Open in Claude Code](https://img.shields.io/badge/2._Open_in-Claude_Code-D97757?style=for-the-badge&logo=anthropic)](https://claude.ai/code/new?q=Read%20AGENTS.md%20and%20README.md%20before%20changing%20code.%20Ask%20me%20what%20app%20to%20build%2C%20then%20implement%20it%20as%20a%20production-ready%20Betfin%20federated%20remote.%20Keep%20the%20public%20%40betfin%2Fsdk%20and%20%40betfin%2Fui%20integration%2C%20Module%20Federation%20manifest%20contract%2C%20i18n%2C%20CSS%20isolation%2C%20and%20verification%20gates%20intact.)

The agent links are regular HTTPS links and work in a browser; no desktop app is required.

1. Click **Use this template** and create your own repository.
2. Open Codex or Claude Code, connect GitHub if prompted, and select the repository you just created.
3. Describe the app you want. The prefilled prompt tells the agent to read this repository's guidance and preserve the host-integration contracts.

> GitHub cannot substitute the new repository's owner and name into a copied README link, so repository selection happens inside the coding agent.

## Quick start

```bash
bun install
bun dev        # standalone at http://localhost:5200
```

Build & serve the production remote (with the CORS/cache headers a host needs):

```bash
bun run build
bun run serve  # serves dist/ (incl. mf-manifest.json + remoteEntry.js) on :5200
```

## How it works

A **remote** exposes modules; a **host** mounts them. This template exposes two:

| Exposed module | Source              | What the host does with it                                  |
| -------------- | ------------------- | ---------------------------------------------------------- |
| `./main`       | `src/pages/main.tsx`| Mounts it as the page for a route (e.g. `/template`).      |
| `./i18n`       | `src/i18n.ts`       | Wraps the page in this remote's own i18next instance.      |

The build (`bun run build`) emits `dist/mf-manifest.json`, the entry a host registers.

### The two-mode component

`src/pages/main.tsx` is **default-exported and provider-free**. That's the whole trick:

- **Standalone** — `src/main.tsx` → `src/bootstrap.tsx` renders the app's own provider stack (Wagmi + QueryClient + I18next) around the page.
- **Federated** — the host imports `./main` directly, inside *its* provider stack. `bootstrap.tsx` never runs.

Either way the page reads whatever providers sit above it. That works because the providers are **shared singletons**.

### Shared singletons (`@betfin/sdk/mf`)

For the page to read the host's state, a handful of packages must resolve to a **single runtime instance** across both apps: `react`, `react-dom`, `@betfin/sdk`, `@tanstack/react-query`, and `react-i18next`. The host declares the same set; MF negotiates one copy so wallet state, `useTranslation()`, and the query layer behave correctly across the boundary.

Two subtleties this template already handles:

- **`requiredVersion` floors.** MF normally infers a singleton's required version from *this repo's installed* version as `^<installed>`. A separate repo has its own lockfile, so it can install a newer **patch** than the host — MF could then reject the host's older singleton and fall back to *this* remote's copy (duplicate instance). The public `@betfin/sdk/mf` export pins each singleton to a permissive **major floor** (`^19.0.0`, `^5.0.0`) so the remote accepts whatever compatible version the host provides.
- **`shareStrategy: 'loaded-first'`** (not `version-first`). The strategy is applied per-remote. `version-first` makes the remote pick the *highest* version in scope — its own newer copy — instead of the host's. `loaded-first` deterministically resolves to the version the host has **already loaded**, which is what a guest remote must do.

### Wallet & host state

`@betfin/sdk` is the public wallet bridge. The host maps its real Privy/wagmi
session into the SDK's plain `WalletState` and provides it once. Because the SDK
is a shared `loaded-first` singleton, this remote's `useWallet()` reads that exact
host value without importing the host's private wallet package. In standalone
mode, `<MockHost>` provides the same contract using an injected browser wallet.

`wagmi` itself is intentionally not shared: the remote uses its own copy only for
standalone wallet development and performs federated read-only chain calls with
`viem`.

### Styling under federation

This is the one non-obvious part. The host's Tailwind build scans *its own* source, so it does **not** contain this remote's utility classes. Therefore the remote ships its **own** Tailwind CSS inside its federated chunk:

- `src/index.css` does `@import "tailwindcss"` + `@source "."` (scan this repo's source).
- It's imported from **`src/pages/main.tsx`** (the exposed module), not only from the standalone entry — so the utilities travel with the federated chunk.
- The PostCSS build prefixes every emitted selector with **`.tpl-scope`**. This
  includes Tailwind utilities, preflight rules, and design tokens, so loading the
  remote cannot override identically named host utilities or `:root` variables.
- `src/pages/main.tsx` owns the `.tpl-scope` boundary. Keep all remote UI inside
  it; if you add a portaled component, configure its portal container inside that
  boundary too.

## Integrate into a host

Merge `manifest.example.json` into the host's whitelabel manifest:

```jsonc
{
  "remotes": { "template": "https://template.your-cdn.com" },   // where THIS remote is served
  "routes": [
    { "path": "/template", "remote": "template", "module": "./main", "i18n": "./i18n" }
  ],
  "sidebar": [
    { "labelKey": "nav.template", "icon": "Boxes", "remote": "template", "to": "/template" }
  ]
}
```

The host fetches this JSON at boot, registers the remote's `mf-manifest.json`, and mounts `/template`. No host redeploy.

**Host requirements:** its public singleton entries must match `@betfin/sdk/mf`, it must use `shareStrategy: 'loaded-first'`, and it must register remotes from the manifest via `@module-federation/runtime`.

## Add another page

1. Create `src/pages/rewards.tsx` (default-exported, provider-free).
2. Add it to `exposes` in `rsbuild.config.ts`: `'./rewards': './src/pages/rewards.tsx'`.
3. Add a route to the host manifest: `{ "path": "/template/rewards", "remote": "template", "module": "./rewards", "i18n": "./i18n" }`.

## Rename the remote

The name `template` appears in: `rsbuild.config.ts` (`REMOTE_NAME`), `manifest.example.json`, and the i18n namespace (`src/i18n.ts` + `src/i18next.d.ts` + `translations/*/template.json`). Update those together. Also replace `.tpl-scope` in `postcss.config.mjs` and every exposed page with a unique scope such as `.rewards-scope`, so two independently deployed remotes cannot style one another.

## Deploy

Any static host works, as long as `mf-manifest.json`, `remoteEntry.js`, and `assets/*` are served with `Access-Control-Allow-Origin: *`.

- **Bun:** `bun run build && bun run serve` (see `scripts/serve.ts` — sets the right CORS + cache headers).
- **Docker:** `docker build -t betfin-template . && docker run -p 5200:5200 betfin-template`.

## Project structure

```
rsbuild.config.ts     federation exposes + the SDK shared config
postcss.config.mjs    Tailwind processing + `.tpl-scope` CSS isolation
manifest.example.json host manifest fragment to register this remote
scripts/serve.ts      static server with CORS + cache headers for the remote
src/
  main.tsx            standalone entry (async boundary → bootstrap)
  bootstrap.tsx       standalone provider stack (not used when federated)
  pages/main.tsx      EXPOSED module ./main — provider-free page
  i18n.ts             EXPOSED module ./i18n — isolated i18next instance
  index.css           Tailwind + scoped theme tokens (ships in the federated chunk)
  components/         self-contained UI (swap for your own design system)
```

## License

MIT — see [LICENSE](./LICENSE).
