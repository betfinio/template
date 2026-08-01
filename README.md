# betfin-template

A **standalone [Module Federation](https://module-federation.io/) remote** template. It runs as its own app during development, then plugs into a host at runtime by adding a few lines to the host's JSON manifest — **no host rebuild**.

Built to match the Betfin host contract, but it depends on **public npm packages only** — no private workspace packages — so anyone can clone, build, and deploy it.

```
Rsbuild 2  ·  React 19  ·  Module Federation 2  ·  wagmi 3  ·  @tanstack/react-query 5  ·  react-i18next 15  ·  Tailwind v4
```

## Create an app with AI — no coding required

[![Create your app repository](https://img.shields.io/badge/1._CREATE_YOUR-APP_REPOSITORY-FACC15?style=for-the-badge&logo=github&logoColor=000000)](https://github.com/betfinio/template/generate)

[![Build with Codex](https://img.shields.io/badge/2._Build_with-Codex-111111?style=for-the-badge&logo=openai)](https://chatgpt.com/codex?prompt=Help%20a%20non-technical%20user%20create%20a%20Betfin%20app%20from%20the%20official%20template%3A%20https%3A%2F%2Fgithub.com%2Fbetfinio%2Ftemplate%0A%0ABefore%20editing%2C%20confirm%20the%20selected%20repository%20was%20created%20from%20that%20template%20and%20read%20AGENTS.md%20and%20README.md.%20If%20no%20repository%20is%20selected%20or%20those%20files%20are%20missing%2C%20stop%20and%20explain%20simply%3A%20open%20https%3A%2F%2Fgithub.com%2Fbetfinio%2Ftemplate%2Fgenerate%2C%20create%20my%20own%20repository%2C%20connect%20GitHub%2C%20and%20select%20it%20here.%20Never%20edit%20betfinio%2Ftemplate%20itself.%0A%0AAsk%20me%3A%20%22What%20app%20would%20you%20like%20to%20create%2C%20and%20what%20should%20people%20be%20able%20to%20do%20in%20it%3F%22%20Use%20plain%20language%2C%20avoid%20technical%20questions%20unless%20blocked%2C%20and%20make%20sensible%20product%2C%20design%2C%20and%20engineering%20decisions%20for%20me.%0A%0AImplement%20the%20complete%2C%20polished%20app%20by%20following%20AGENTS.md.%20Preserve%20the%20public%20%40betfin%2Fsdk%20and%20%40betfin%2Fui%20integrations%20and%20every%20federation%2C%20manifest%2C%20provider%2C%20i18n%2C%20CSS-isolation%2C%20and%20verification%20contract.%20Rename%20the%20example%2C%20routes%2C%20translations%2C%20and%20manifest%20consistently.%20Run%20all%20required%20checks%20and%20fix%20failures.%0A%0AEnd%20with%20a%20simple%20summary%20and%20numbered%20deployment%20and%20Betfin%20host-manifest%20instructions.%20Assume%20I%20have%20no%20coding%2C%20Git%2C%20terminal%2C%20Module%20Federation%2C%20or%20deployment%20knowledge.)

[![Build with Claude Code](https://img.shields.io/badge/2._Build_with-Claude_Code-D97757?style=for-the-badge&logo=anthropic)](https://claude.ai/code/new?q=Help%20a%20non-technical%20user%20create%20a%20Betfin%20app%20from%20the%20official%20template%3A%20https%3A%2F%2Fgithub.com%2Fbetfinio%2Ftemplate%0A%0ABefore%20editing%2C%20confirm%20the%20selected%20repository%20was%20created%20from%20that%20template%20and%20read%20AGENTS.md%20and%20README.md.%20If%20no%20repository%20is%20selected%20or%20those%20files%20are%20missing%2C%20stop%20and%20explain%20simply%3A%20open%20https%3A%2F%2Fgithub.com%2Fbetfinio%2Ftemplate%2Fgenerate%2C%20create%20my%20own%20repository%2C%20connect%20GitHub%2C%20and%20select%20it%20here.%20Never%20edit%20betfinio%2Ftemplate%20itself.%0A%0AAsk%20me%3A%20%22What%20app%20would%20you%20like%20to%20create%2C%20and%20what%20should%20people%20be%20able%20to%20do%20in%20it%3F%22%20Use%20plain%20language%2C%20avoid%20technical%20questions%20unless%20blocked%2C%20and%20make%20sensible%20product%2C%20design%2C%20and%20engineering%20decisions%20for%20me.%0A%0AImplement%20the%20complete%2C%20polished%20app%20by%20following%20AGENTS.md.%20Preserve%20the%20public%20%40betfin%2Fsdk%20and%20%40betfin%2Fui%20integrations%20and%20every%20federation%2C%20manifest%2C%20provider%2C%20i18n%2C%20CSS-isolation%2C%20and%20verification%20contract.%20Rename%20the%20example%2C%20routes%2C%20translations%2C%20and%20manifest%20consistently.%20Run%20all%20required%20checks%20and%20fix%20failures.%0A%0AEnd%20with%20a%20simple%20summary%20and%20numbered%20deployment%20and%20Betfin%20host-manifest%20instructions.%20Assume%20I%20have%20no%20coding%2C%20Git%2C%20terminal%2C%20Module%20Federation%2C%20or%20deployment%20knowledge.)

These are regular HTTPS links and work in a browser; no desktop app is required. You only need a GitHub account and access to either coding agent.

1. Click **Create your app repository**, choose a name, and let GitHub copy this template into your account.
2. From your new repository, click **Build with Codex** or **Build with Claude Code**.
3. Connect GitHub if asked and select the repository you just created.
4. Answer one simple question about what you want the app to do. The agent handles the code, design-system integration, checks, and technical decisions.

The prompt also tells the agent to guide you through any missing setup in plain language and finish with exact deployment and host-manifest steps. **Build with Claude Code** uses Claude Code rather than a normal Claude Artifact because this flow creates a real, deployable GitHub project.

<details>
<summary>Prompt used by both agent buttons (copy it if it is not prefilled)</summary>

```text
Help a non-technical user create a Betfin app from the official template: https://github.com/betfinio/template

Before editing, confirm the selected repository was created from that template and read AGENTS.md and README.md. If no repository is selected or those files are missing, stop and explain simply: open https://github.com/betfinio/template/generate, create my own repository, connect GitHub, and select it here. Never edit betfinio/template itself.

Ask me: "What app would you like to create, and what should people be able to do in it?" Use plain language, avoid technical questions unless blocked, and make sensible product, design, and engineering decisions for me.

Implement the complete, polished app by following AGENTS.md. Preserve the public @betfin/sdk and @betfin/ui integrations and every federation, manifest, provider, i18n, CSS-isolation, and verification contract. Rename the example, routes, translations, and manifest consistently. Run all required checks and fix failures.

End with a simple summary and numbered deployment and Betfin host-manifest instructions. Assume I have no coding, Git, terminal, Module Federation, or deployment knowledge.
```

</details>

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
