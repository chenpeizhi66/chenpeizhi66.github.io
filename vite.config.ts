import { defineConfig } from 'vite';

// User site (USERNAME.github.io) is served from /.
// A project site (USERNAME.github.io/REPO/) needs base: '/REPO/'.
export default defineConfig({
  base: '/',
  build: {
    target: 'es2022',
  },
  server: {
    host: '127.0.0.1',
    port: 43123,
  },
});
