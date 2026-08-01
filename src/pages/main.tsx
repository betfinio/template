import { TemplateShell } from '@/components/template/shell';

// The federated surface. Default-exported and PROVIDER-FREE — the host supplies
// everything it needs through shared singletons: the wallet via `@betfin/sdk`
// (`useWallet`) and the query client via shared `@tanstack/react-query`. So the
// exact same component works as the host-mounted page AND (wrapped in `<MockHost>`)
// the standalone dev page.
//
// Importing the stylesheet HERE — not only in main.tsx — makes the Tailwind
// utilities this remote uses ship inside the federated chunk, so styling is present
// even when the host (which never scanned this repo) mounts the page.
import '@/index.css';

export default function Main() {
	return (
		<div className="tpl-scope">
			<TemplateShell />
		</div>
	);
}
