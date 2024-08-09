import instance from '@/src/i18n.ts';
import { createRootRoute } from '@tanstack/react-router';
import { Root } from 'betfinio_app/root';

export const Route = createRootRoute({
	component: () => <Root id={'template'} instance={instance} />,
});
