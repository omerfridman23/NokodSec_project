import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@common/sharedTypes': path.resolve(__dirname, '../common/sharedTypes.ts'),
      '@components': path.resolve(__dirname, './src/components'),
    },
  },
  plugins: [react()],
});
