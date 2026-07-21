import { TemplateShell } from '@/components/template/shell';

// The federated surface. Default-exported and provider-free, so the exact same
// component is BOTH the standalone page (rendered by bootstrap.tsx) AND the
// Module Federation `exposes` entry (`template/main`) a host imports directly.
//
// Importing the stylesheet HERE — not only in main.tsx — is deliberate: it makes
// the Tailwind utilities this remote uses ship inside the *federated chunk*, so
// styling is present even when the host, which never scanned this repo's source,
// mounts the page. See index.css and the README's "Styling under federation".
import '@/index.css';

export default function Main() {
	return <TemplateShell />;
}
