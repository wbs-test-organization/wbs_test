import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    basicSsl(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:7075',
        changeOrigin: true,
        secure: false,  // Bỏ check self-signed của backend (dev only)
      },
    },
  },
})
