import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Critical: enables SPA routing on refresh in Chrome
    historyApiFallback: true,
    proxy: {
      // Optional: uncomment to avoid CORS in dev mode
      // '/api': { target: 'http://localhost:8080', rewrite: (path) => path.replace(/^\/api/, '') }
    }
  },
  preview: {
    port: 4173,
    historyApiFallback: true,
  },
})
