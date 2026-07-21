import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Minimal, secret-free wagmi config for STANDALONE dev only — a public RPC and the
// browser-injected connector (MetaMask etc.), so `bun dev` works with zero setup.
//
// Under federation this file never evaluates: the host owns the WagmiProvider and
// `wagmi` is a shared singleton, so the exposed page's `useAccount()` transparently
// reads the host's wallet (Privy, WalletConnect, whatever the host wired) instead
// of this config. That is the whole point — the page is wallet-agnostic.
export const wagmiConfig = createConfig({
	chains: [mainnet],
	connectors: [injected()],
	transports: { [mainnet.id]: http() },
});
