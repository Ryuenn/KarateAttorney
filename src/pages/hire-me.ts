/**
 * /hire-me — alias of /lawyer (spec §3): one-click forward to the firm site.
 */
import type { APIRoute } from 'astro';
import { FIRM_URL } from '../lib/site';

export const prerender = false;

export const GET: APIRoute = ({ redirect }) => redirect(FIRM_URL, 302);
