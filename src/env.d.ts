/// <reference types="astro/client" />

import type Lenis from 'lenis';

declare global {
  interface Window {
    /** Shared Lenis instance, set by src/scripts/motion.ts (absent when
     * reduced motion is preferred or JS is disabled). */
    __lenis?: Lenis;
    /** Plausible event helper, present when that provider is configured. */
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
    /** gtag helper, present when the GA4 provider is configured. */
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    /** Cloudflare Turnstile, present only when PUBLIC_TURNSTILE_SITE_KEY is
     * set and the widget script has loaded. */
    turnstile?: { reset?: (widget?: string) => void };
  }
}

export {};
