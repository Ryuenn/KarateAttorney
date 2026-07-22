// @ts-check
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

// Static-first hybrid: pages prerender by default; server routes (e.g. the
// speaker-request endpoint) opt out with `export const prerender = false`.
export default defineConfig({
  site: 'https://karateattorney.com',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  // Self-hosted at build time via Astro's fonts API — no runtime Google
  // requests. Both faces are swappable placeholders until the client signs
  // off on final brand typography.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Archivo',
      cssVariable: '--font-archivo',
      weights: ['500 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial', 'sans-serif'],
    },
    {
      // Elegant serif for the classic law-firm variant (Homepage 3).
      provider: fontProviders.google(),
      name: 'Cormorant Garamond',
      cssVariable: '--font-cormorant',
      weights: ['400 600'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
