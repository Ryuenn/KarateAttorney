// @ts-check
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Static-first hybrid: pages prerender by default; server routes (e.g. the
// speaker-request endpoint) opt out with `export const prerender = false`.
export default defineConfig({
  site: 'https://karateattorney.com',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [tailwindcss()],
  },
});
