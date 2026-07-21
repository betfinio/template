import { createI18n } from '@betfin/sdk';
import en from './translations/en/template.json';
import es from './translations/es/template.json';

export const defaultNS = 'template' as const;

// One namespace per remote (`template`), one JSON file per locale. Add locales by
// dropping another `translations/<lng>/template.json` and registering it here.
export const resources = {
	en: { template: en },
	es: { template: es },
} as const;

export type AppResources = (typeof resources)['en'];

// Built with the SDK's shared `createI18n`, so it matches the host's i18next setup
// (ICU + language detection). The host mounts this instance and bridges the active
// language across the federation boundary (see `registerRemoteI18n`/`useI18nBridge`).
const i18n = createI18n(defaultNS, resources);

export default i18n;
