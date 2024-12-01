import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', '@hookform/resolvers/zod'],
  },
  resolve: {
    alias: {
      '@hookform/resolvers/zod': '@hookform/resolvers/zod/dist/zod.js',
    },
  },
});
