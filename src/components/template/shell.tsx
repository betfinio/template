import { useQuery } from '@tanstack/react-query';
import { Boxes, Globe, Plug, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function short(addr?: string) {
	return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';
}

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
 * The template's feature UI. Everything here reads a SHARED singleton:
 *  - `useAccount()` / `useConnect()` → the host's wallet (shared `wagmi`)
 *  - `useQuery()` → the host's query cache (shared `@tanstack/react-query`)
 *  - `useTranslation()` → this remote's i18next instance (shared `react-i18next`)
 * None of them know or care whether they're running standalone or federated.
 *
 * The root element carries `tpl-root`, which is where index.css scopes the theme
 * tokens — so the app is themeable without clobbering the host's `:root`.
 */
export function TemplateShell() {
	const { t } = useTranslation('template');
	const { address, isConnected } = useAccount();
	const { connect, connectors, isPending } = useConnect();
	const { disconnect } = useDisconnect();
	const injectedConnector = connectors[0];

	// Demo query — proves the shared query cache works across the boundary. Uses a
	// public JSON-RPC endpoint, no key required.
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
							<Wallet className="size-4 text-primary" />
							{t('wallet.title')}
						</CardTitle>
						<CardDescription>{t('wallet.desc')}</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col items-start gap-3">
						{isConnected ? (
							<>
								<code className="rounded-md bg-muted px-3 py-2 text-sm">{short(address)}</code>
								<Button variant="outline" size="sm" onClick={() => disconnect()}>
									{t('wallet.disconnect')}
								</Button>
							</>
						) : (
							<Button size="sm" disabled={!injectedConnector || isPending} onClick={() => injectedConnector && connect({ connector: injectedConnector })}>
								{isPending ? t('wallet.connecting') : t('wallet.connect')}
							</Button>
						)}
						<p className="text-muted-foreground text-xs">{t('wallet.hint')}</p>
					</CardContent>
				</Card>

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
