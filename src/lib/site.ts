/**
 * Central site constants. Anything marked [PLACEHOLDER] needs a real value
 * from the client — keep the marker until it's confirmed.
 */

export const SITE = {
  name: 'The Karate Attorney',
  person: 'Ibrahim Awad',
  url: 'https://karateattorney.com',
  tagline:
    'Trial lawyer, martial artist, and speaker — the same discipline in the courtroom, on the mat, and on the stage.',
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
 * Homepage direction chosen (owner request, 2026-07-24): the variant
 * switcher is retired and the site runs on the single Homepage 1 design.
 * Eight links, matching spec §3. Every route below now exists and carries
 * its page hero; the sections beneath each hero are still to come. Contact
 * remains a placeholder ('#') — that page is being handled separately.
 *
 * `/giving` (Giving Back) and the firm site are reachable from the footer
 * and the header's "Need Legal Help?" CTA respectively, so neither takes a
 * nav slot.
 */
export const NAV: readonly { label: string; href: string }[] = [
  { label: 'My Story', href: '/about' },
  { label: 'Speaking', href: '/speaking' },
  { label: 'The Attorney', href: '/attorney' },
  { label: 'Martial Artist', href: '/martial-artist' },
  { label: 'Faith', href: '/faith' },
  { label: 'Ventures', href: '/ventures' },
  { label: 'Content', href: '/content' },
  { label: 'Contact', href: '#' },
];

/** Nav items pinned in the desktop header bar. */
export const HEADER_NAV = NAV;

/**
 * Marker attribute for every outbound firm-site link. The analytics layer
 * listens for clicks on [data-firm-link] — a firm click is the site's
 * secondary conversion (spec §6).
 */
export const FIRM_LINK_ATTR = { 'data-firm-link': true } as const;
