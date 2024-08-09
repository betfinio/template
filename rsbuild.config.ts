import {defineConfig} from '@rsbuild/core';
import {pluginReact} from '@rsbuild/plugin-react';
import {ModuleFederationPlugin} from "@module-federation/enhanced/rspack";
import {TanStackRouterRspack} from '@tanstack/router-plugin/rspack'
import {dependencies} from "./package.json";


const getApp = () => {
	switch (process.env.PUBLIC_ENVIRONMENT) {
		case 'development':
			return 'betfinio_app@https://betfin-app-dev.web.app/mf-manifest.json'
		case 'production':
			return 'betfinio_app@https://betfin-app.web.app/mf-manifest.json'
		default:
			return 'betfinio_app@http://localhost:5555/mf-manifest.json'
	}
}

export default defineConfig({
	server: {
		port: 7777,
	},
	dev: {
		assetPrefix: 'http://localhost:7777',
	},
	html: {
		title: 'BetFin Template',
		favicon: './src/assets/favicon.svg',
	},
	output: {
		assetPrefix: process.env.PUBLIC_ENVIRONMENT === 'production' ? 'https://betfin-template.web.app' : 'https://betfin-template-dev.web.app'
	},
	plugins: [pluginReact()],
	tools: {
		rspack: (config, {appendPlugins}) => {
			config.output!.uniqueName = 'betfinio_template';
			appendPlugins([
				TanStackRouterRspack(),
				new ModuleFederationPlugin({
					name: 'betfinio_template',
					remotes: {
						betfinio_app: getApp(),
					},
					shared: {
						'react': {
							singleton: true,
							requiredVersion: dependencies['react']
						},
						'react-dom': {
							singleton: true,
							requiredVersion: dependencies['react-dom']
						},
						"@tanstack/react-router": {
							singleton: true,
							requiredVersion: dependencies['@tanstack/react-router']
						},
						"@tanstack/react-query": {
							singleton: true,
							requiredVersion: dependencies['@tanstack/react-query']
						},
						"@tanstack/react-table": {
							singleton: true,
							requiredVersion: dependencies['@tanstack/react-table']
						},
						"lucide-react": {
							singleton: true,
							requiredVersion: dependencies['lucide-react']
						},
						"@supabase/supabase-js": {
							singleton: true,
							requiredVersion: dependencies['@supabase/supabase-js']
						},
						"i18next": {
							singleton: true,
							requiredVersion: dependencies['i18next']
						},
						"react-i18next": {
							singleton: true,
							requiredVersion: dependencies['react-i18next']
						},
						"tailwindcss-animate": {
							singleton: true,
							requiredVersion: dependencies['tailwindcss-animate']
						},
						"tailwindcss": {
							singleton: true,
							requiredVersion: dependencies['tailwindcss']
						},
						"wagmi": {
							singleton: true,
							requiredVersion: dependencies['wagmi']
						},
					},
				}),
			]);
		},
	},
});
