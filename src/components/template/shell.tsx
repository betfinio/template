import { useWallet } from '@betfin/sdk';
import { Button } from '@betfin/ui/components/button';
import { useQuery } from '@tanstack/react-query';
import { Boxes, Coins, Plug, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createPublicClient, erc20Abi, formatEther, formatUnits, http } from 'viem';
import { polygon, polygonAmoy } from 'viem/chains';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BET_TOKEN, isSupportedChain, type SupportedChainId } from '@/tokens';

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

// Read-only public clients — no wallet connection needed for balance reads.
const publicClients = {
	[polygon.id]: createPublicClient({ chain: polygon, transport: http() }),
	[polygonAmoy.id]: createPublicClient({ chain: polygonAmoy, transport: http() }),
} as const;

function shortAddress(addr?: string) {
	return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';
}

function fmtAmount(value: string | undefined) {
	if (value == null) return '—';
	return Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 });
}

async function fetchBalances(chainId: SupportedChainId, address: `0x${string}`) {
	const client = publicClients[chainId];
	const token = BET_TOKEN[chainId];
	const [pol, betRaw, betDecimals] = await Promise.all([
		client.getBalance({ address }),
		client.readContract({ address: token, abi: erc20Abi, functionName: 'balanceOf', args: [address] }),
		client.readContract({ address: token, abi: erc20Abi, functionName: 'decimals' }),
	]);
	return { pol: formatEther(pol), bet: formatUnits(betRaw, betDecimals) };
}

/**
 * Wallet card. The identity (address / chain / connect) comes from the shared
 * `@betfin/sdk` `useWallet()` — the HOST's connected wallet when federated, the
 * `<MockHost>` dev wallet when standalone. Balances are read independently via
 * public RPC (viem), so there's exactly ONE wallet connection (the host's).
 */
function WalletCard() {
	const { t } = useTranslation('template');
	const { address, isConnected, chainId, login } = useWallet();

	const cid = isSupportedChain(chainId) ? chainId : undefined;
	const { data } = useQuery({
		queryKey: ['balances', chainId, address],
		enabled: isConnected && Boolean(cid && address),
		staleTime: 30_000,
		queryFn: () => fetchBalances(cid as SupportedChainId, address as `0x${string}`),
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Wallet className="size-4 text-primary" />
					{t('wallet.title')}
				</CardTitle>
				<CardDescription>{t('wallet.desc')}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{!isConnected ? (
					<Button size="sm" className="w-fit" onClick={() => login()}>
						{t('wallet.connect')}
					</Button>
				) : (
					<>
						<div className="flex flex-col gap-1">
							<span className="text-muted-foreground text-xs uppercase tracking-wide">{t('wallet.address')}</span>
							<code className="w-fit rounded-md bg-muted px-3 py-1.5 text-sm">{shortAddress(address)}</code>
						</div>

						{cid ? (
							<div className="grid grid-cols-2 gap-3">
								<div className="rounded-lg border border-border bg-muted/40 p-4">
									<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
										<Coins className="size-3.5" />
										{t('wallet.pol')}
									</div>
									<div className="mt-1 font-semibold text-xl tabular-nums">{fmtAmount(data?.pol)}</div>
								</div>
								<div className="rounded-lg border border-border bg-muted/40 p-4">
									<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
										<Coins className="size-3.5" />
										{t('wallet.bet')}
									</div>
									<div className="mt-1 font-semibold text-xl tabular-nums">{fmtAmount(data?.bet)}</div>
								</div>
							</div>
						) : (
							<p className="text-muted-foreground text-sm">{t('wallet.wrongChain')}</p>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * The template's feature UI. Everything is driven by shared singletons the host
 * provides (`@betfin/sdk` wallet, shared query client, shared react-i18next), so
 * it works federated and standalone alike.
 */
export function TemplateShell() {
	const { t } = useTranslation('template');

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

			<WalletCard />

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
