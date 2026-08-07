import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), vueDevTools()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	build: {
		// lightningcss (the default CSS minifier) collapses backdrop-filter and
		// -webkit-backdrop-filter into just the -webkit- prefix, which non-Safari
		// browsers ignore. esbuild's minifier keeps both declarations as written.
		cssMinify: 'esbuild',
	},
});
