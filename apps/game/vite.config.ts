import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3001,
  },
  base: process.env.GITHUB_PAGES === 'true' ? '/traceplay' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
