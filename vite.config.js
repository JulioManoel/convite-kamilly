import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Allow ngrok (and similar tunnels) to reach the Vite dev server
    allowedHosts: true,
  },
})
