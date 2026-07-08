import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 5173,
    strictPort: false,
    // El proyecto está en una unidad de red; el watcher nativo falla (errno -4094).
    // usePolling permite detectar cambios de archivos sobre el share de red.
    watch: {
      usePolling: true,
    },
  },
})
