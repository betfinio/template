import { useAccount, useConnect, useDisconnect } from 'wagmi';

/**
 * STANDALONE fallback for the host's `@workspace/web3` package.
 *
 * `@workspace/web3` is the host's wallet singleton. It's private and unpublished,
 * so this repo can't import the real thing at build time — this shim stands in.
 * `vite.config.ts` aliases `@workspace/web3` → this file, and `mf.shared.ts`
 * declares `@workspace/web3` a shared singleton with `loaded-first`. So:
 *
 *   - Federated into a host that shares `@workspace/web3`: MF resolves the import
 *     to the HOST's real module, and `useWallet()` returns the host's connected
 *     wallet (one wallet, connected via the host's UI). This shim never runs.
 *   - Standalone (`bun dev`): there's no host, so this fallback runs and provides
 *     a working wallet through the template's own wagmi config + injected wallet.
 *
 * Only the surface the template actually uses is implemented here.
 */
export function useWallet() {
	const { address, isConnected, chainId } = useAccount();
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();

	return {
		address,
		isConnected,
		chainId,
		login: () => {
			const connector = connectors[0];
			if (connector) connect({ connector });
		},
		logout: () => disconnect(),
	};
}
