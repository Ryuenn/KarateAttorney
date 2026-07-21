/**
 * /lawyer — instant forward to the firm site (spec §3), for social bios and
 * video descriptions. Real HTTP redirect served by the Node adapter.
 * 302 (not 301) so the destination can be repointed (e.g. to a campaign
 * URL) without fighting browser-cached permanent redirects.
 */
import type { APIRoute } from 'astro';
import { FIRM_URL } from '../lib/site';

export const prerender = false;

export const GET: APIRoute = ({ redirect }) => redirect(FIRM_URL, 302);
