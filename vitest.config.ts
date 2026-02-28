// @ts-nocheck
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/data': path.resolve(__dirname, 'data'),
      '@/layouts': path.resolve(__dirname, 'layouts'),
      '@/css': path.resolve(__dirname, 'css'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
