import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { WagmiProvider } from 'wagmi';
import i18n from './i18n';
import Main from './pages/main';
import { wagmiConfig } from './wagmi';

// The standalone provider stack. These are the SAME singletons a host provides in
// production (react, wagmi, react-query, react-i18next) — declared shared in
// `mf.shared.ts` — so the exposed page reads whichever provider tree sits above
// it: this one when standalone, the host's when federated. The page component
// (src/pages/main.tsx) renders NO providers of its own, which is exactly what lets
// it be reused unchanged across both.
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<I18nextProvider i18n={i18n}>
			<WagmiProvider config={wagmiConfig}>
				<QueryClientProvider client={queryClient}>
					<div className="mx-auto w-full max-w-[1100px] px-4 py-8">
						<Main />
					</div>
				</QueryClientProvider>
			</WagmiProvider>
		</I18nextProvider>
	</StrictMode>,
);
