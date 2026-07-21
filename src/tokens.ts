import { polygon, polygonAmoy } from 'viem/chains';

/** Chains this app reads balances on. */
export const SUPPORTED_CHAIN_IDS = [polygonAmoy.id, polygon.id] as const;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

/** BET token (Betfin) — public on-chain addresses, keyed by chain id. */
export const BET_TOKEN: Record<SupportedChainId, `0x${string}`> = {
	[polygon.id]: '0xbF7970D56a150cD0b60BD08388A4A75a27777777',
	[polygonAmoy.id]: '0x0F19ef9416d384F12d87Edf0733C11843F358e3d',
};

export function isSupportedChain(id: number | undefined): id is SupportedChainId {
	return id != null && (SUPPORTED_CHAIN_IDS as readonly number[]).includes(id);
}
