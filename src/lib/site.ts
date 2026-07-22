/**
 * Central site constants. Anything marked [PLACEHOLDER] needs a real value
 * from the client — keep the marker until it's confirmed.
 */

export const SITE = {
  name: 'The Karate Attorney',
  person: 'Ibrahim Awad',
  url: 'https://karateattorney.com',
  tagline:
    '[PLACEHOLDER: one-line identity statement — e.g. trial lawyer · martial artist · speaker]',
} as const;

/** The law-firm site every legal-intent visitor must be routed to. */
export const FIRM_URL = 'https://theawadlawfirm.com';

/** Venture links (spec §3 — /ventures cards link out). */
export const VENTURES = {
  palistory: '[PLACEHOLDER: Palistory URL]',
  awadAcademy: '[PLACEHOLDER: Awad Academy URL]',
  teamKarateAttorney: '[PLACEHOLDER: Team Karate Attorney URL]',
} as const;

/** Social profiles — handles not confirmed. */
export const SOCIALS = [
  { label: 'Instagram', href: '[PLACEHOLDER: Instagram URL]' },
  { label: 'YouTube', href: '[PLACEHOLDER: YouTube URL]' },
  { label: 'TikTok', href: '[PLACEHOLDER: TikTok URL]' },
  { label: 'LinkedIn', href: '[PLACEHOLDER: LinkedIn URL]' },
] as const;

/**
 * Homepage-variant exploration phase (owner request, 2026-07-22): the site
 * is temporarily reduced to three homepage design candidates. The full
 * page set (about/speaking/content/contact/…) lives in git history and
 * returns once a direction is chosen.
 */
export const NAV = [
  { label: 'Homepage 1', href: '/' },
  { label: 'Homepage 2', href: '/homepage-2' },
  { label: 'Homepage 3', href: '/homepage-3' },
] as const;

/** Nav items pinned in the desktop header bar. */
export const HEADER_NAV = NAV;

/**
 * Marker attribute for every outbound firm-site link. The analytics layer
 * listens for clicks on [data-firm-link] — a firm click is the site's
 * secondary conversion (spec §6).
 */
export const FIRM_LINK_ATTR = { 'data-firm-link': true } as const;
