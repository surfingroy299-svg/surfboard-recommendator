import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Isolated exploration workspace. fs.allow includes the design-exploration
// root so shared/mock-data JSON can be imported; nothing outside is touched.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5178,
    fs: { allow: ['../..', '.'] },
  },
})
