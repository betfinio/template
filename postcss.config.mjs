// The remote ships its own Tailwind output because the host never scans this
// repository. Prefix every generated selector so those utilities and base rules
// cannot override identically named host classes after the remote CSS is loaded.
export default {
	plugins: {
		'@tailwindcss/postcss': {},
		'postcss-prefix-selector': { prefix: '.tpl-scope' },
	},
};
