import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0', // Đảm bảo lắng nghe trên mọi interface
    
    strictPort: true,
    allowedHosts: '*', // 👈 Thêm dòng này để cho phép truy cập từ tên miền Render
  }
})
