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

/** Primary nav (subset shown in the header bar; full list in menu + footer). */
export const NAV = [
  { label: 'My Story', href: '/about' },
  { label: 'Speaking', href: '/speaking' },
  { label: 'The Attorney', href: '/attorney' },
  { label: 'The Martial Artist', href: '/martial-artist' },
  { label: 'Faith & Community', href: '/faith' },
  { label: 'Ventures', href: '/ventures' },
  { label: 'Giving Back', href: '/giving' },
  { label: 'Content Hub', href: '/content' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Nav items pinned in the desktop header bar. */
export const HEADER_NAV = [
  { label: 'My Story', href: '/about' },
  { label: 'Speaking', href: '/speaking' },
  { label: 'Content', href: '/content' },
  { label: 'Contact', href: '/contact' },
] as const;

/**
 * Marker attribute for every outbound firm-site link. The analytics layer
 * listens for clicks on [data-firm-link] — a firm click is the site's
 * secondary conversion (spec §6).
 */
export const FIRM_LINK_ATTR = { 'data-firm-link': true } as const;
