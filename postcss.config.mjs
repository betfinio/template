// Tailwind v4 via PostCSS (Rsbuild's CSS pipeline auto-loads this). Replaces the
// `@tailwindcss/vite` plugin used on Vite. `@source` directives in the CSS still
// drive scanning (including `@betfin/ui`'s shipped dist).
export default {
	plugins: {
		'@tailwindcss/postcss': {},
	},
};
