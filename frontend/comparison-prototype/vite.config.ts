import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Isolated prototype: no proxy, no backend, static mock data only.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5179, strictPort: true },
  preview: { port: 5179 },
})
