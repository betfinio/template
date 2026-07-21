import { createConfig, http } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

/**
 * This remote's OWN wagmi config. It's deliberately self-contained (bundled, and
 * NOT listed in `mf.shared.ts`) so the exposed page can mount its own
 * `WagmiProvider` and read a wallet whether it runs standalone or federated —
 * without depending on, or colliding with, the host's private wallet stack.
 *
 * The injected connector talks to the browser wallet (MetaMask, etc.) for the
 * current page origin. When federated into a host where the same browser wallet
 * is already authorized, it reconnects to the same account automatically.
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

/** BET token (Betfin) — public on-chain addresses, keyed by chain id. */
export const BET_TOKEN: Record<number, `0x${string}`> = {
	[polygon.id]: '0xbF7970D56a150cD0b60BD08388A4A75a27777777',
	[polygonAmoy.id]: '0x0F19ef9416d384F12d87Edf0733C11843F358e3d',
};

declare module 'wagmi' {
	interface Register {
		config: typeof wagmiConfig;
	}
}
