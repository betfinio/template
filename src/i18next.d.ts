import type { AppResources } from './i18n';

// Typed translation keys: `t('wallet.title')` is checked against the JSON.
declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'template';
		resources: AppResources;
	}
}
