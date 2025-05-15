import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import prefresh from '@prefresh/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), prefresh()],
  build: {
    outDir: 'build',
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      '@': path.resolve(__dirname, './src'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/state': path.resolve(__dirname, './src/state'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
});
