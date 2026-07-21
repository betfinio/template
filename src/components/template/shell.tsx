import { useQuery } from '@tanstack/react-query';
import { Boxes, Globe, Plug, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample host-manifest fragment shown in the UI so the demo is self-documenting.
const INTEGRATION_SNIPPET = `{
  "remotes": { "template": "https://template.your-cdn.com" },
  "routes": [
    { "path": "/template", "remote": "template", "module": "./main", "i18n": "./i18n" }
  ],
  "sidebar": [
    { "labelKey": "nav.template", "icon": "Boxes", "remote": "template", "to": "/template" }
  ]
}`;

/**
 * The template's feature UI. Everything here works whether the app runs standalone
 * or federated into a host, because it only depends on things a remote can safely
 * share across the boundary:
 *   - `useTranslation()` → this remote's own i18next instance (shared react-i18next)
 *   - `useQuery()`       → a query client (its own standalone, the host's when mounted)
 *
 * It deliberately does NOT call wallet hooks directly. A host's wallet provider
 * lives inside ITS OWN wallet package (e.g. wagmi + Privy), not on the bare shared
 * `wagmi` singleton — so an independent remote cannot read it via `useAccount()`.
 * See the "Wallet & host state" card and the README for the correct approaches.
 */
export function TemplateShell() {
	const { t } = useTranslation('template');

	// Demo query — renders a live value and shows the query layer works across the
	// boundary. Uses a public JSON-RPC endpoint, no key required.
	const { data: block, isLoading } = useQuery({
		queryKey: ['template', 'eth-block'],
		queryFn: async () => {
			const res = await fetch('https://cloudflare-eth.com', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
			});
			const json = (await res.json()) as { result?: string };
			return json.result ? Number.parseInt(json.result, 16) : null;
		},
		staleTime: 30_000,
	});

	return (
		<div className="tpl-root flex flex-col gap-6 text-foreground">
			<header className="flex flex-col gap-2">
				<div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground text-xs">
					<Boxes className="size-3.5" />
					{t('badge')}
				</div>
				<h1 className="font-bold text-3xl tracking-tight">{t('title')}</h1>
				<p className="max-w-[62ch] text-muted-foreground">{t('subtitle')}</p>
			</header>

			<div className="grid gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Globe className="size-4 text-primary" />
							{t('query.title')}
						</CardTitle>
						<CardDescription>{t('query.desc')}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="font-semibold text-2xl tabular-nums">{isLoading ? '…' : (block?.toLocaleString() ?? '—')}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Wallet className="size-4 text-primary" />
							{t('wallet.title')}
						</CardTitle>
						<CardDescription>{t('wallet.desc')}</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm leading-relaxed">{t('wallet.body')}</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Plug className="size-4 text-primary" />
						{t('integrate.title')}
					</CardTitle>
					<CardDescription>{t('integrate.desc')}</CardDescription>
				</CardHeader>
				<CardContent>
					<pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs leading-relaxed">
						<code>{INTEGRATION_SNIPPET}</code>
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
