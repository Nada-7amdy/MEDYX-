import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API_TARGET = `http://127.0.0.1:${process.env.PORT ?? 8787}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Vendor code changes far less often than app code. Splitting it out
        // means an app deploy does not invalidate the (large, stable) React
        // and animation runtime in the user's cache.
        // Rolldown (Vite 8) requires the function form.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (/[\\/]node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/.test(id)) {
            return 'vendor-motion';
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Allow the sandboxed preview host (e2b.app) to reach the dev server.
    allowedHosts: true,
    watch: { usePolling: true },
    // Browser-facing code calls same-origin /auth and /api; the dev server
    // proxies them to the API process. The browser never sees localhost.
    proxy: {
      '/auth': { target: API_TARGET, changeOrigin: true },
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/auth': { target: API_TARGET, changeOrigin: true },
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
})
