import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // usePolling ensures file-change events reach Vite inside Docker
    watch: {
      usePolling: true,
      interval: 300,
    },
    // HMR WebSocket must connect on the browser-visible port (not the internal one)
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      '/api/auth': {
        target: 'http://auth-service:5001',
        changeOrigin: true,
      },
      '/api/courses': {
        target: 'http://course-service:5002',
        changeOrigin: true,
      },
      '/api/progress': {
        target: 'http://progress-service:5003',
        changeOrigin: true,
      },
      '/api/notifications': {
        target: 'http://notification-service:5004',
        changeOrigin: true,
      }
    }
  }
})
