import { createConfig, http } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

/**
 * This remote's wagmi config. Two jobs:
 *   1. Read-only balance queries (POL / BET) via public RPC — these work for any
 *      address without a connection, so they run fine when federated (reading the
 *      host wallet's address) and standalone alike.
 *   2. The standalone wallet connection (injected connector), used only when this
 *      app runs on its own — see src/shims/workspace-web3.tsx. When federated, the
 *      host owns the connection and this config is used purely for reads.
 */
export const wagmiConfig = createConfig({
	chains: [polygonAmoy, polygon],
	connectors: [injected()],
	multiInjectedProviderDiscovery: false,
	transports: {
		[polygonAmoy.id]: http(),
		[polygon.id]: http(),
	},
});

/** Chains this remote can read balances on. */
export const SUPPORTED_CHAIN_IDS = [polygonAmoy.id, polygon.id] as const;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

/** BET token (Betfin) — public on-chain addresses, keyed by chain id. */
export const BET_TOKEN: Record<SupportedChainId, `0x${string}`> = {
	[polygon.id]: '0xbF7970D56a150cD0b60BD08388A4A75a27777777',
	[polygonAmoy.id]: '0x0F19ef9416d384F12d87Edf0733C11843F358e3d',
};

declare module 'wagmi' {
	interface Register {
		config: typeof wagmiConfig;
	}
}
