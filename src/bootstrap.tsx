import { MockHost } from '@betfin/sdk/mock';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import i18n from './i18n';
import Main from './pages/main';

// Standalone entry. `<MockHost>` (from @betfin/sdk) provides an offline dev wallet
// (browser-injected), a query client, dark theme, and i18n — so this app runs fully
// on its own without the private host. Under federation this file is never used:
// the host mounts the exposed `./main` directly and supplies the REAL wallet, so
// the same page component (src/pages/main.tsx) reads the host's wallet instead.
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<MockHost i18n={i18n}>
			<div className="mx-auto w-full max-w-[1100px] px-4 py-8">
				<Main />
			</div>
		</MockHost>
	</StrictMode>,
);
