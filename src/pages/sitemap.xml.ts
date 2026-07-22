/**
 * sitemap.xml (spec §6) — generated at build time. Excludes noindex pages
 * (styleguide, thanks screens), API routes, and the /lawyer + /hire-me
 * redirects.
 */
import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

// Homepage-variant phase: only the live homepage is listed (variants 2/3
// are noindex drafts). Restore the full route list with the page set.
const STATIC_ROUTES = ['/'];

export const GET: APIRoute = async () => {
  const urls = STATIC_ROUTES.map((path) => ({
    loc: `${SITE.url}${path}`,
    lastmod: '',
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
