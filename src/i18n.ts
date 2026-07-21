import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
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

// Each remote ships its OWN isolated i18next instance and exposes it as `./i18n`.
// A host mounts the exposed page inside this instance's I18nextProvider and
// forwards its own language changes to it (the host owns the active language).
// Because `react-i18next` is a shared singleton, `useTranslation()` inside the
// page resolves to this instance's `template` namespace across the boundary.
const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
	resources,
	lng: 'en',
	fallbackLng: 'en',
	defaultNS,
	ns: ['template'],
	interpolation: { escapeValue: false },
});

export default i18n;
