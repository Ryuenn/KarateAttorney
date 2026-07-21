/**
 * Analytics event layer (spec §6). Provider-agnostic: track() forwards to
 * whichever provider Analytics.astro configured.
 *
 * Wired events:
 *  - firm_link_click  — click on any [data-firm-link] (secondary conversion)
 *  - ka:conversion    — custom DOM events from pages (primary conversion is
 *    speaker_request_submitted, fired on /speaking/thanks)
 */
const provider = import.meta.env.PUBLIC_ANALYTICS_PROVIDER ?? 'none';

export function track(event: string, props?: Record<string, unknown>): void {
  if (provider === 'plausible') {
    window.plausible?.(event, props ? { props } : undefined);
  } else if (provider === 'ga4') {
    window.gtag?.('event', event, props ?? {});
  } else if (import.meta.env.DEV) {
    console.debug('[analytics]', event, props ?? {});
  }
}

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement | null;
  const link = target?.closest?.('a[data-firm-link]');
  if (link) {
    track('firm_link_click', {
      page: location.pathname,
      href: link.getAttribute('href') ?? '',
    });
  }
});

document.addEventListener('ka:conversion', (e) => {
  const name = (e as CustomEvent<{ event?: string }>).detail?.event;
  if (name) track(name);
});
