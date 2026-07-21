/**
 * Content Hub collection (spec §3): videos, reels, and articles the owner
 * authors himself as Markdown files in src/content/hub/. Filterable by
 * category on /content.
 */
import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

export const HUB_CATEGORIES = [
  { value: 'legal-education', label: 'Legal education' },
  { value: 'motivational', label: 'Motivational' },
  { value: 'faith', label: 'Faith' },
] as const;

const hub = defineCollection({
  loader: glob({ base: './src/content/hub', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['legal-education', 'motivational', 'faith']),
    type: z.enum(['video', 'reel', 'article']),
    date: z.coerce.date(),
    /** For video/reel entries: the YouTube/Instagram/TikTok URL. */
    videoUrl: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { hub };
