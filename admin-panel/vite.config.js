import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: false,
    // Unidad de red: el watcher nativo falla (errno -4094); usePolling lo soluciona.
    watch: {
      usePolling: true,
    },
  },
})
