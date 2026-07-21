import { Boxes, Coins, Plug, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { erc20Abi, formatUnits } from 'viem';
import { useBalance, useReadContract } from 'wagmi';
import { useWallet } from '@workspace/web3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BET_TOKEN, SUPPORTED_CHAIN_IDS, type SupportedChainId } from '@/wagmi';

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

function isSupportedChain(id: number | undefined): id is SupportedChainId {
	return id != null && (SUPPORTED_CHAIN_IDS as readonly number[]).includes(id);
}

/**
 * Wallet card. The IDENTITY (address / chain / connect) comes from the shared
 * `@workspace/web3` singleton — i.e. the HOST's connected wallet when federated,
 * so there's ONE wallet, connected through the host's UI. Balances are read
 * independently via public RPC for that address, so no second connection exists.
 */
function WalletCard() {
	const { t } = useTranslation('template');
	const { address, isConnected, chainId, login } = useWallet();

	const cid = isSupportedChain(chainId) ? chainId : undefined;
	const betAddress = cid ? BET_TOKEN[cid] : undefined;

	// POL — native balance, read on the wallet's chain via public RPC.
	const { data: pol } = useBalance({
		address,
		chainId: cid,
		query: { enabled: isConnected && Boolean(cid) },
	});
	const polFormatted = pol ? formatUnits(pol.value, pol.decimals) : undefined;

	// BET — ERC-20 balanceOf + decimals for that address.
	const { data: betRaw } = useReadContract({
		address: betAddress,
		abi: erc20Abi,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		chainId: cid,
		query: { enabled: isConnected && Boolean(betAddress && address) },
	});
	const { data: betDecimals } = useReadContract({
		address: betAddress,
		abi: erc20Abi,
		functionName: 'decimals',
		chainId: cid,
		query: { enabled: Boolean(betAddress) },
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
					</>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * The template's feature UI. The wallet card reflects the host's connected wallet
 * (via the shared `@workspace/web3` singleton) when federated, and falls back to
 * this remote's own wallet when run standalone.
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
