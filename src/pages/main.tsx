import { WagmiProvider } from 'wagmi';
import { TemplateShell } from '@/components/template/shell';
import { wagmiConfig } from '@/wagmi';

// The federated surface. Default-exported so the exact same component is BOTH the
// standalone page (rendered by bootstrap.tsx) AND the Module Federation `exposes`
// entry (`template/main`) a host imports directly.
//
// It brings its OWN `WagmiProvider` so the wallet works in both modes. The wagmi
// hooks below it need a QueryClient too — that comes from whatever mounts the page
// (bootstrap standalone, or the host's shared query client when federated).
//
// Importing the stylesheet HERE — not only in main.tsx — makes the Tailwind
// utilities this remote uses ship inside the *federated chunk*, so styling is
// present even when the host (which never scanned this repo) mounts the page.
import '@/index.css';

export default function Main() {
	return (
		<WagmiProvider config={wagmiConfig}>
			<TemplateShell />
		</WagmiProvider>
	);
}
