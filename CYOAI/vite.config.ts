import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [react()],
	server: {
		port: 8080,
		host: '0.0.0.0',
		proxy: {
			'^/(app|api|assets|files|private)': {
				target: 'http://yoursite.localhost:8000',
				changeOrigin: true,
				ws: true,
			},
			'/api': {
				target: 'http://erpnextcyoai.ddns.net:8080',
				changeOrigin: true,
				secure: false,
			},
			'/assets': {
				target: 'http://erpnextcyoai.ddns.net:8080',
				changeOrigin: true,
				secure: false,
			},
		},
	},
	resolve: {
		alias: {
			'@': '/src'
		}
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		target: 'es2015',
		minify: 'terser',
		sourcemap: mode === 'development',
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					frappe: ['frappe-react-sdk']
				}
			}
		}
	},
	define: {
		__APP_VERSION__: JSON.stringify('1.0.0'),
		__BUILD_TIME__: JSON.stringify(new Date().toISOString())
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		css: true
	}
}));
