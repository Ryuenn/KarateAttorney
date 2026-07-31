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

/**
 * Contact details — [PLACEHOLDER] until confirmed by the client. Shared by
 * the footer and /contact so the two can never drift apart; swap the values
 * here once and both pick them up.
 */
export const CONTACT = {
  phone: { label: '+01 23456789', href: 'tel:+0123456789' },
  email: {
    label: 'info@karateattorney.com',
    href: 'mailto:info@karateattorney.com',
  },
  booking: {
    label: 'speaking@karateattorney.com',
    href: 'mailto:speaking@karateattorney.com',
  },
  /** Street lines for /contact. Rendered as written, one line each. */
  address: ['[PLACEHOLDER: street address]', '[PLACEHOLDER: city, state ZIP]'],
} as const;

/**
 * Office hours for /contact — [PLACEHOLDER] hours, not confirmed. The shape
 * (a day and a span per row) is what the layout needs; the values are a
 * stand-in so the column reads correctly until the real ones land.
 */
export const OFFICE_HOURS: readonly { day: string; hours: string }[] = [
  { day: 'Monday', hours: '09:00 – 18:00' },
  { day: 'Tuesday', hours: '09:00 – 18:00' },
  { day: 'Wednesday', hours: '09:00 – 18:00' },
  { day: 'Thursday', hours: '09:00 – 18:00' },
  { day: 'Friday', hours: '09:00 – 18:00' },
  { day: 'Saturday', hours: 'By appointment' },
  { day: 'Sunday', hours: 'Closed' },
];

/**
 * Venture links (spec §3 — /ventures cards link out).
 *
 * The third venture is The Awad Law Firm, which already has a real URL in
 * FIRM_URL above — so it is deliberately not repeated here. Team Karate
 * Attorney is no longer a venture; it lives on /martial-artist.
 */
export const VENTURES = {
  palistory: '[PLACEHOLDER: Palistory URL]',
  awadAcademy: '[PLACEHOLDER: Awad Academy URL]',
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
 * Seven links: spec §3 listed eight, but /faith was removed on the owner's
 * request (2026-07-31) and its route deleted. Every route below exists.
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
  { label: 'Ventures', href: '/ventures' },
  { label: 'Content', href: '/content' },
  { label: 'Contact', href: '/contact' },
];

/** Nav items pinned in the desktop header bar. */
export const HEADER_NAV = NAV;

/**
 * Marker attribute for every outbound firm-site link. The analytics layer
 * listens for clicks on [data-firm-link] — a firm click is the site's
 * secondary conversion (spec §6).
 */
export const FIRM_LINK_ATTR = { 'data-firm-link': true } as const;
