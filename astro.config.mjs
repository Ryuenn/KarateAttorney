// @ts-check
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

// Static-first hybrid on Vercel: pages prerender to static HTML; the two
// form endpoints (prerender=false) deploy as Vercel serverless functions.
export default defineConfig({
  site: 'https://karateattorney.com',
  output: 'static',
  adapter: vercel(),
  // Self-hosted at build time via Astro's fonts API — no runtime Google
  // requests. Headings use a system Helvetica Neue stack (matching the XNRGY
  // reference) defined directly in global.css — no webfont needed — so only
  // the Inter body face is downloaded here. Inter is a swappable placeholder
  // until the client signs off on final brand typography.
  fonts: [
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
      // Technical monospace for nav links, CTA labels, and small meta text
      // (the "subtext" kickers) — matches the reference's Space Mono.
      provider: fontProviders.google(),
      name: 'Space Mono',
      cssVariable: '--font-space-mono',
      weights: ['400', '700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
