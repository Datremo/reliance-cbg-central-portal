import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Forces it to run on localhost:3000
    strictPort: true, // Throws an error if 3000 is already taken
  }
})