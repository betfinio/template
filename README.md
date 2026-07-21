# betfin-template

A **standalone [Module Federation](https://module-federation.io/) remote** template. It runs as its own app during development, then plugs into a host at runtime by adding a few lines to the host's JSON manifest — **no host rebuild**.

Built to match the Betfin host contract, but it depends on **public npm packages only** — no private workspace packages — so anyone can clone, build, and deploy it.

```
Vite 8  ·  React 19  ·  Module Federation (@module-federation/vite)  ·  wagmi 3  ·  @tanstack/react-query 5  ·  react-i18next 15  ·  Tailwind v4
```

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

### Shared singletons (`mf.shared.ts`)

For the page to read the host's state, a handful of packages must resolve to a **single runtime instance** across both apps. That's `react`, `react-dom`, `wagmi`, `@tanstack/react-query`, and `react-i18next`. The host declares the same set; MF negotiates one copy.

The payoff: the page calls `useAccount()` from **public `wagmi`** and gets the *host's* connected wallet — even though the host wires wallets with its own private stack (Privy/WalletConnect). No private dependency needed. Same story for the query cache and i18n.

> Keep these package **versions** compatible with the host's (see `package.json`). With `singleton: true`, a hard mismatch warns and MF falls back to one instance (the host's, since it loads first) — matching majors avoids surprises.

### Styling under federation

This is the one non-obvious part. The host's Tailwind build scans *its own* source, so it does **not** contain this remote's utility classes. Therefore the remote ships its **own** Tailwind CSS inside its federated chunk:

- `src/index.css` does `@import "tailwindcss"` + `@source "."` (scan this repo's source).
- It's imported from **`src/pages/main.tsx`** (the exposed module), not only from the standalone entry — so the utilities travel with the federated chunk.
- Theme tokens are scoped under **`.tpl-root`** (the shell's wrapper element), not `:root`, so federating never overwrites the host's own CSS variables.

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

**Host requirements:** it must share the same singletons (`mf.shared.ts`) with `shareStrategy: 'loaded-first'` and register remotes from the manifest via `@module-federation/runtime`.

## Add another page

1. Create `src/pages/rewards.tsx` (default-exported, provider-free).
2. Add it to `exposes` in `vite.config.ts`: `'./rewards': './src/pages/rewards.tsx'`.
3. Add a route to the host manifest: `{ "path": "/template/rewards", "remote": "template", "module": "./rewards", "i18n": "./i18n" }`.

## Rename the remote

The name `template` appears in: `vite.config.ts` (`REMOTE_NAME`), `manifest.example.json`, the i18n namespace (`src/i18n.ts` + `src/i18next.d.ts` + `translations/*/template.json`), and the `.tpl-root` class (`src/index.css` + `src/components/template/shell.tsx`). Update all five and you're done.

## Deploy

Any static host works, as long as `mf-manifest.json`, `remoteEntry.js`, and `assets/*` are served with `Access-Control-Allow-Origin: *`.

- **Bun:** `bun run build && bun run serve` (see `scripts/serve.ts` — sets the right CORS + cache headers).
- **Docker:** `docker build -t betfin-template . && docker run -p 5200:5200 betfin-template`.

## Project structure

```
vite.config.ts        federation() exposes + shared config
mf.shared.ts          the shared-singleton contract (must match the host)
manifest.example.json host manifest fragment to register this remote
scripts/serve.ts      static server with CORS + cache headers for the remote
src/
  main.tsx            standalone entry (async boundary → bootstrap)
  bootstrap.tsx       standalone provider stack (not used when federated)
  pages/main.tsx      EXPOSED module ./main — provider-free page
  i18n.ts             EXPOSED module ./i18n — isolated i18next instance
  index.css           Tailwind + scoped theme tokens (ships in the federated chunk)
  wagmi.ts            standalone-only wallet config
  components/         self-contained UI (swap for your own design system)
```

## License

MIT — see [LICENSE](./LICENSE).
