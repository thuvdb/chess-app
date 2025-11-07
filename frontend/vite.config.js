import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Quan trọng để Render có thể truy cập
    port: process.env.PORT || 10000,
    },
    preview: {
      host: '0.0.0.0',
      port: process.env.PORT || 10000,
    }
  })
