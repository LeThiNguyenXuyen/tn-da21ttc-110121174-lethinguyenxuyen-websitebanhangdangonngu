import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Port cố định cho ứng dụng admin
    strictPort: true // Báo lỗi nếu port bị chiếm thay vì tự động chuyển port
  }
})
