import { Boxes, Coins, Plug, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { erc20Abi, formatUnits } from 'viem';
import { useAccount, useBalance, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BET_TOKEN } from '@/wagmi';

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

function shortAddress(addr?: string) {
	return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';
}

function fmtAmount(value: string | undefined) {
	if (value == null) return '—';
	return Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 });
}

/** Connected address + POL (native) and BET (ERC-20) balances on Polygon/Amoy. */
function WalletCard() {
	const { t } = useTranslation('template');
	const { address, isConnected, chainId } = useAccount();
	const { connect, connectors, isPending } = useConnect();
	const { disconnect } = useDisconnect();
	const injectedConnector = connectors[0];

	const betAddress = chainId ? BET_TOKEN[chainId] : undefined;
	const supported = Boolean(betAddress);

	// Balances read on the wallet's CURRENT chain (chainId omitted → wagmi uses the
	// active connection's chain), which is the same chain `betAddress` is keyed to.
	// POL — native balance.
	const { data: pol } = useBalance({
		address,
		query: { enabled: isConnected && supported },
	});
	const polFormatted = pol ? formatUnits(pol.value, pol.decimals) : undefined;

	// BET — ERC-20 balanceOf + decimals.
	const { data: betRaw } = useReadContract({
		address: betAddress,
		abi: erc20Abi,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: { enabled: isConnected && supported && Boolean(address) },
	});
	const { data: betDecimals } = useReadContract({
		address: betAddress,
		abi: erc20Abi,
		functionName: 'decimals',
		query: { enabled: supported },
	});
	const bet = betRaw != null ? formatUnits(betRaw, betDecimals ?? 18) : undefined;

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
					<Button size="sm" className="w-fit" disabled={!injectedConnector || isPending} onClick={() => injectedConnector && connect({ connector: injectedConnector })}>
						{isPending ? t('wallet.connecting') : t('wallet.connect')}
					</Button>
				) : (
					<>
						<div className="flex flex-col gap-1">
							<span className="text-muted-foreground text-xs uppercase tracking-wide">{t('wallet.address')}</span>
							<code className="w-fit rounded-md bg-muted px-3 py-1.5 text-sm">{shortAddress(address)}</code>
						</div>

						{supported ? (
							<div className="grid grid-cols-2 gap-3">
								<div className="rounded-lg border border-border bg-muted/40 p-4">
									<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
										<Coins className="size-3.5" />
										{t('wallet.pol')}
									</div>
									<div className="mt-1 font-semibold text-xl tabular-nums">{fmtAmount(polFormatted)}</div>
								</div>
								<div className="rounded-lg border border-border bg-muted/40 p-4">
									<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
										<Coins className="size-3.5" />
										{t('wallet.bet')}
									</div>
									<div className="mt-1 font-semibold text-xl tabular-nums">{fmtAmount(bet)}</div>
								</div>
							</div>
						) : (
							<p className="text-muted-foreground text-sm">{t('wallet.wrongChain')}</p>
						)}

						<Button variant="outline" size="sm" className="w-fit" onClick={() => disconnect()}>
							{t('wallet.disconnect')}
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * The template's feature UI. The wallet card uses this remote's OWN
 * `WagmiProvider` (see pages/main.tsx), so it works standalone and federated
 * alike — an independent wallet connection, not the host's.
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
