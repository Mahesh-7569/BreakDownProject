import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],

  base: '/',

  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:8080',
        target: 'http://192.168.1.36:8080', // Updated IP and Port
        changeOrigin: true,
        secure: false,
      },
    },
  },

  define: {
    global: 'window',
  },
})