import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// User site (USERNAME.github.io) is served from /.
// A project site (USERNAME.github.io/REPO/) needs base: '/REPO/'.
export default defineConfig({
  base: '/',
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        gallery: resolve(import.meta.dirname, 'gallery/index.html'),
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 43123,
  },
});
