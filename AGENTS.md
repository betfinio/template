# Betfin Federated App Agent Guide

This repository is a production-oriented starting point for an independently
developed Betfin application. The finished application must work in two modes:

1. Standalone at its own origin for local development and review.
2. As a runtime-loaded Module Federation remote inside the Betfin web host.

Treat the federation boundary as part of the application API. Build the product
the user requests, but preserve the integration contract described here.

## Primary objective

Replace the demo feature with a focused, polished application that can be
deployed independently and mounted by the host through a JSON manifest. Use the
public `@betfin/sdk` for platform state and the public `@betfin/ui` package for
the design system. This repository must remain usable without access to the
private Betfin monorepo.

Unless the user explicitly requests infrastructure work, preserve the existing
Rsbuild, Module Federation, SDK-sharing, CSS-isolation, and standalone-bootstrap
architecture.

## Non-negotiable integration contract

Every implementation must retain all of these properties:

1. **Public dependencies only.** Never add or import `@workspace/*` packages or
   copy private host code. `@betfin/sdk` and `@betfin/ui` are the public boundary.
2. **Provider-free exposed pages.** Every module listed in `exposes` must
   default-export a React component. It must not call `createRoot`, create a
   router, or install wallet/query/i18n/theme providers. The host already owns
   those providers.
3. **Standalone providers stay in `src/bootstrap.tsx`.** The host never imports
   that file. `<MockHost>` exists only to make standalone development resemble
   the real host.
4. **Keep the asynchronous entry boundary.** `src/main.tsx` must dynamically
   import `./bootstrap`. A static bootstrap import can evaluate shared modules
   before Module Federation initializes them.
5. **Use the canonical federation map.** Keep `shared: mfShared` and
   `shareStrategy: mfRemoteShareStrategy`, imported from `@betfin/sdk/mf`. Do
   not reproduce or customize that map locally. The strategy is intentionally
   `loaded-first` so the host's SDK and React contexts are authoritative.
6. **Do not share wagmi, viem, i18next core, or a router.** The SDK map omits
   them deliberately. Sharing them can create an incompatible provider/context
   instance or synchronous module-evaluation failure.
7. **Ship and isolate this app's CSS.** Import `@/index.css` from every exposed
   page, keep the PostCSS selector prefix, and place all remote UI beneath the
   matching scope element. The host does not scan this repository for Tailwind
   classes.
8. **Use a unique CSS scope per derived app.** A new app must replace
   `.tpl-scope` in both `postcss.config.mjs` and every exposed page with a unique
   class such as `.rewards-scope`. Reusing `.tpl-scope` across multiple remotes
   allows their independently generated styles to affect one another.
9. **Keep remote identity synchronized.** The same remote key must appear in
   `REMOTE_NAME`, `manifest.example.json`, route/sidebar entries, and deployment
   documentation. Rename the i18n namespace and its files at the same time.
10. **Preserve cross-origin delivery.** A deployment must expose
    `mf-manifest.json`, `remoteEntry.js`, and all chunks with
    `Access-Control-Allow-Origin: *`. Do not remove `assetPrefix: 'auto'` or the
    server CORS headers without an equivalent tested solution.

## Start-of-task protocol

Before implementing a feature:

1. Read this file, `README.md`, `package.json`, `rsbuild.config.ts`,
   `src/pages/main.tsx`, `src/bootstrap.tsx`, `src/i18n.ts`, and
   `manifest.example.json`.
2. Run `bun install` when dependencies are not installed.
3. Inspect the installed public API instead of guessing it:
   - SDK types: `node_modules/@betfin/sdk/dist/**/*.d.ts`
   - UI exports: `node_modules/@betfin/ui/package.json`
   - UI component types: `node_modules/@betfin/ui/dist/components/*.d.ts`
4. Identify the app slug, public route, exposed modules, locales, and any
   on-chain data requirements from the user's request.
5. Preserve unrelated user changes and avoid committing secrets or local files.

If the user gives an app name but not an integration slug, derive a lowercase,
stable slug from the app name and use it consistently. Ask only when the choice
would materially change the requested product or deployment.

## Architecture and file ownership

| Path | Responsibility | Rules |
| --- | --- | --- |
| `src/main.tsx` | Standalone MF entry | Keep the dynamic `import('./bootstrap')`; no feature code here. |
| `src/bootstrap.tsx` | Standalone-only render tree | Keep `<MockHost>` here; never import it from an exposed page. |
| `src/pages/main.tsx` | Exposed `./main` page | Default export, provider-free, imports CSS, owns the app-specific scope wrapper. |
| `src/components/` | Feature and reusable UI | Prefer small domain components and public `@betfin/ui` primitives. |
| `src/i18n.ts` | Isolated remote i18n instance | Use `createI18n`; expose it as `./i18n`. |
| `src/i18next.d.ts` | Typed translation keys | Keep namespace and resource typing aligned with `src/i18n.ts`. |
| `src/translations/` | Locale JSON | Keep every locale structurally complete. |
| `src/index.css` | Tailwind and Betfin theme entry | Keep both imports and `@source "."`; do not import global host CSS. |
| `postcss.config.mjs` | CSS isolation | Prefix with the unique app scope used by exposed pages. |
| `rsbuild.config.ts` | Remote identity and exposes | Use SDK MF exports; preserve CORS and asset behavior. |
| `manifest.example.json` | Host integration fragment | Keep remote, routes, sidebar, modules, and URLs synchronized. |
| `scripts/serve.ts` | Production-like static server | Preserve CORS and cache behavior for MF bootstrap files/chunks. |

The standalone execution path is:

```text
src/main.tsx -> dynamic import -> src/bootstrap.tsx -> MockHost -> exposed page
```

The federated execution path is:

```text
host manifest -> mf-manifest.json -> exposed page inside host providers
```

`src/bootstrap.tsx` and `src/main.tsx` are not part of the federated page tree.

## Building an application from the template

For a new app named `rewards`, make these coordinated changes:

1. Set `REMOTE_NAME = 'rewards'` in `rsbuild.config.ts`.
2. Rename the package and human-facing metadata where appropriate.
3. Change the CSS prefix to `.rewards-scope` in `postcss.config.mjs`.
4. Change the wrapper in every exposed page to `className="rewards-scope"`.
5. Rename the `template` i18n namespace and JSON filenames to `rewards`.
6. Replace the demo shell with the requested product.
7. Update `manifest.example.json` with the deployed base URL and route.
8. Update `README.md` so setup, behavior, and manifest instructions describe
   the actual app rather than the starter.

A correct exposed page follows this shape:

```tsx
import { RewardsApp } from '@/components/rewards/rewards-app';
import '@/index.css';

export default function RewardsPage() {
  return (
    <div className="rewards-scope">
      <RewardsApp />
    </div>
  );
}
```

For additional host routes, create another provider-free page, wrap it in the
same unique scope, import `@/index.css`, add it to `exposes`, and add the exact
module name to the host manifest. Prefer separate exposed pages over embedding a
second top-level router in the remote.

## Public SDK usage

### Wallet state

Use the SDK wallet bridge for the host's connected identity:

```tsx
import { useWallet } from '@betfin/sdk';

const {
  address,
  isConnected,
  chainId,
  isReady,
  login,
  logout,
} = useWallet();
```

`WalletState` is deliberately limited to plain state and callbacks:

- `address?: \`0x${string}\``
- `isConnected: boolean`
- `chainId?: number`
- `isReady?: boolean`
- `login(): void`
- `logout(): void`

Important consequences:

- Use `useWallet()`, not wagmi's `useAccount()`, for federated identity.
- Call `login()` to open the host's connection flow; do not build a second
  connection modal in the exposed page.
- Treat `isReady === false` separately from a ready-but-disconnected state when
  the UI needs an initialization state.
- The current public SDK does **not** expose a wallet client, signer,
  `writeContract`, `sendTransaction`, or arbitrary signing API. Do not pretend a
  write flow will work through the host. If the requested app requires signing
  or transactions, report that platform-contract requirement and request an SDK
  extension or host action bridge before implementing the write path.

For read-only chain data, use this app's own `viem` public client and gate queries
on a supported `chainId` and valid address. The demo in
`src/components/template/shell.tsx` is the reference pattern.

### Query state

`@tanstack/react-query` is a shared singleton. Use normal `useQuery` and
`useMutation` APIs for application data, with stable query keys and explicit
loading, error, empty, and stale states. A query mutation is not a substitute
for an unavailable wallet signing API.

### Theme

The platform is dark-only. `useTheme()` is available from `@betfin/sdk` and
reports the dark theme, but most components should simply use semantic design
tokens such as `bg-card`, `text-foreground`, `text-muted-foreground`,
`border-border`, and `text-primary`.

Do not render `WalletProvider`, `PlatformHost`, or `ThemeProvider` inside an
exposed page. Those are host-side APIs. Do not render `<MockHost>` there either.

### Internationalization

Create the remote's isolated instance with `createI18n`:

```ts
import { createI18n } from '@betfin/sdk';
import en from './translations/en/rewards.json';
import es from './translations/es/rewards.json';

export const defaultNS = 'rewards' as const;
export const resources = {
  en: { rewards: en },
  es: { rewards: es },
} as const;

export type AppResources = (typeof resources)['en'];
export default createI18n(defaultNS, resources);
```

Use `useTranslation('<namespace>')` for user-facing application copy. When a
locale is added, register it in `resources`, add a complete JSON resource, and
keep `src/i18next.d.ts` synchronized. The host loads the exposed `./i18n` module
and propagates language changes through the shared bridge.

The host sidebar is translated by the host namespace, not by this remote's page
namespace. A sidebar `labelKey` therefore needs to be an existing host key; when
no host translation change is available, use a readable literal string as the
key so i18next's key fallback remains understandable.

## Public UI package

Import components from explicit public subpaths. The package has no root
component barrel:

```tsx
import { Button } from '@betfin/ui/components/button';
import { Input } from '@betfin/ui/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@betfin/ui/components/table';
import { cn } from '@betfin/ui/lib/utils';
```

The currently published package includes these component families:

- Inputs/actions: button, input, input-group, textarea, checkbox, radio-group,
  select, slider, switch, toggle, and toggle-group.
- Layout/data: accordion, badge, breadcrumb, calendar, carousel, chart,
  collapsible, progress, scroll-area, separator, table, and tabs.
- Overlays: alert-dialog, command, context-menu, dialog, drawer, dropdown-menu,
  popover, sheet, sonner, and tooltip.
- Betfin helpers: app-header, bet-value, loading, member-profile, and sidebar.

Inspect the installed `.d.ts` before using a component because its API may
change independently of this template. Prefer these components over recreating
equivalent controls. Local, app-specific composition components belong under
`src/components/`.

`src/index.css` already imports `@betfin/ui/theme.css`. Do not additionally
import `@betfin/ui/globals.css`; it is the internal-monorepo stylesheet and is not
the isolated external entry.

### Portaled overlay warning

CSS is intentionally scoped beneath the app's unique scope element. A dialog,
menu, select, tooltip, or other overlay that portals directly to `document.body`
is outside that scope and may be unstyled. For every overlay:

1. Inspect whether the published wrapper creates a portal.
2. Render its portal into an element inside the app scope when the component API
   exposes a container option.
3. If the wrapper does not expose a scoped portal container, use a non-portaled
   composition or implement a local accessible alternative whose DOM remains
   inside the scope.
4. Test the opened overlay in both standalone and federated modes.

Do not remove CSS isolation merely to make an overlay appear styled; that would
allow the remote's Tailwind utilities and preflight rules to alter the host.

## Styling rules

- Use Tailwind v4 utilities and the semantic tokens shipped by
  `@betfin/ui/theme.css`.
- Design for the host's content region. Do not add a second global header,
  sidebar, bottom navigation, or page-width shell unless the requested product
  specifically needs an internal control surface.
- Keep the exposed root responsive and width-safe. Avoid fixed viewport widths.
- Use `cn` for conditional class composition.
- Keep custom global CSS minimal and scoped. Prefer component utilities.
- Do not style `html`, `body`, or `:root` outside the existing prefixing pipeline.
- If a component must escape the root (portal, toast, modal), solve its scoped
  container explicitly and test it.
- Preserve keyboard focus, labels, contrast, reduced-motion behavior, and touch
  targets. Icon-only buttons require accessible names.

## Data, environment, and security

- Browser-visible configuration must use `PUBLIC_*` variables and be documented
  in `.env.example`. Never place secrets in `PUBLIC_*` variables.
- Never commit private RPC credentials, API keys, seed phrases, private keys, or
  authenticated URLs.
- Validate external data at its boundary and render explicit error/empty states.
- Keep contract addresses and supported chain IDs centralized rather than
  scattering string literals through components.
- Use checksummed `0x` address types where possible.
- Avoid state-changing network calls during render. Put asynchronous work in
  query functions, event handlers, or effects with cleanup.
- Do not assume the host's private environment variables or internal APIs exist.

## Manifest integration

The host appends `/mf-manifest.json` to the remote base URL. Do not put the
manifest filename in `remotes`:

```json
{
  "remotes": {
    "rewards": "https://rewards.example.com"
  },
  "routes": [
    {
      "path": "/rewards",
      "remote": "rewards",
      "module": "./main",
      "i18n": "./i18n"
    }
  ],
  "sidebar": [
    {
      "labelKey": "Rewards",
      "icon": "Gift",
      "remote": "rewards",
      "to": "/rewards"
    }
  ]
}
```

Manifest rules:

- Merge entries into existing `remotes`, `routes`, and `sidebar` collections;
  never replace unrelated entries.
- `remote` must equal `REMOTE_NAME` and the key in `remotes`.
- `module` must exactly match a key in `exposes`.
- `i18n` may be omitted only when the remote has no localized resources.
- `path` must be unique, absolute, and owned by this app.
- `icon` is a Lucide icon export name; an unknown name falls back to a generic
  icon in the host.
- A manifest hosted independently can add the app without rebuilding host JS.
  Users must reload so the host fetches the updated manifest at boot.

## Dependency and configuration policy

- Use Bun and commit `bun.lock` whenever dependencies change.
- Prefer existing dependencies and platform packages before adding another
  library.
- Keep React, React DOM, SDK, React Query, and react-i18next versions compatible
  with `@betfin/sdk/mf`.
- Do not edit generated files under `dist/` or `node_modules/`.
- Do not remove the optional connector aliases in `rsbuild.config.ts` unless the
  corresponding connector is intentionally installed, used, and tested.
- Do not turn on Module Federation DTS generation casually; this independent
  remote currently publishes runtime exposes only.
- Keep TypeScript strict and do not silence errors with broad `any`,
  `@ts-ignore`, or disabled checks.

## Code conventions

- Follow the repository's Biome configuration: tabs for indentation and single
  quotes in JavaScript/TypeScript. Run the formatter rather than hand-aligning
  code.
- Use the `@/` alias for imports within `src` and direct public package subpaths
  for SDK/UI imports.
- Prefer named domain components and focused hooks over one oversized page
  component. Keep data access separate from presentation when it improves
  loading/error handling or testability.
- Prefer discriminated unions and narrow types over boolean combinations and
  type assertions. Validate unknown network responses before trusting them.
- Avoid non-null assertions unless the invariant is immediate and unavoidable.
- Do not leave dead demo code, placeholder copy, commented-out alternatives,
  debugging logs, or unused translations in the finished app.
- Add tests for non-trivial pure logic or state transitions when introducing a
  test runner is proportionate to the feature. Do not claim test coverage when
  only typecheck/build commands were run.

## Required verification

Run these commands after implementation:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run check
bun run build
```

Then verify behavior, not just compilation:

### Standalone

1. Run `bun dev` and open `http://localhost:5200`.
2. Exercise loading, error, empty, disconnected, and connected states relevant
   to the feature.
3. Test keyboard navigation and responsive layouts.
4. Confirm the browser console has no errors or federation version warnings.

### Federated

1. Point the host's local manifest at `http://localhost:5200`.
2. Open the manifest route through the real host.
3. Confirm the exposed page renders without its standalone bootstrap.
4. Confirm `useWallet()` reflects the host state and the connect action invokes
   the host flow.
5. Switch host language and verify the mounted remote updates.
6. Open all overlays and verify they are styled, positioned, and interactive.
7. Check at desktop and mobile widths that remote CSS did not change host
   navigation, typography, spacing, visibility utilities, or theme variables.
8. Confirm all remote manifest, entry, JS, CSS, font, and image requests succeed
   from the remote origin with no CORS failures.

### Production output

Run `bun run serve` after the build and verify at minimum:

```bash
curl -I http://localhost:5200/mf-manifest.json
curl -I http://localhost:5200/remoteEntry.js
```

Both should be successful and include an appropriate
`Access-Control-Allow-Origin` header. The build must emit `dist/mf-manifest.json`
and `dist/remoteEntry.js`.

If a relevant verification cannot be run, state exactly what was not tested and
why. Do not describe an untested integration as complete.

## Definition of done

An implementation is complete only when:

- The requested product works as a coherent application, not a placeholder.
- Every exposed page is default-exported, provider-free, CSS-importing, and
  wrapped in the unique app scope.
- Remote name, exposes, i18n namespace, translations, CSS scope, manifest, and
  documentation agree.
- Host identity comes from `useWallet()` and no unsupported signing path is
  implied.
- Public `@betfin/ui` components and semantic tokens are used consistently.
- Loading, error, empty, disconnected, and unsupported-chain states are handled.
- Standalone and federated behavior have both been tested.
- Typecheck, Biome check, and production build pass.
- Deployment output is cross-origin loadable by the host.
- No secrets, private workspace imports, unrelated files, or generated output
  are committed.

## Code review rules

Flag a change during review when it does any of the following:

- Adds providers, `createRoot`, host chrome, or a router to an exposed page.
- Reads host wallet state from wagmi instead of `@betfin/sdk`.
- Claims transaction/signature support that the current SDK does not provide.
- Replaces the SDK federation map or changes `loaded-first` behavior.
- Removes the exposed-page CSS import, unique scope wrapper, selector prefix, or
  cross-origin asset configuration.
- Uses a generic `.tpl-scope` after the app has been renamed.
- Imports private `@workspace/*` packages or `@betfin/ui/globals.css`.
- Uses a portaled UI component without verifying scoped styling in the host.
- Adds untranslated visible copy while the app otherwise supports locales.
- Overwrites unrelated host manifest entries.
- Introduces secrets, unsafe wallet assumptions, inaccessible controls, or
  unhandled asynchronous states.

When a requested feature conflicts with this contract, explain the conflict and
propose the smallest SDK, host, or manifest extension needed. Do not silently
bypass the boundary.
