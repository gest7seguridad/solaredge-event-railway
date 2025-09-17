import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/', // Asegurar base path correcto para producción
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // En producción (Railway), compilar directamente en backend/public
    outDir: process.env.NODE_ENV === 'production' ? '../backend/public' : 'dist',
    emptyOutDir: true, // Limpiar el directorio antes de compilar
    assetsDir: 'assets',
    sourcemap: false, // Deshabilitar sourcemaps en producción para optimizar
    rollupOptions: {
      output: {
        manualChunks: undefined, // Simplificar para evitar problemas de chunking
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})