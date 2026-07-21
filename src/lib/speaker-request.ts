/**
 * Speaker Request domain: option lists + zod schema (spec §5).
 * Shared by the form UI and the POST endpoint — server-side validation is
 * the source of truth; client attributes only improve UX.
 */
import { z } from 'astro/zod';

export const ORG_TYPES = [
  { value: 'masjid', label: 'Masjid' },
  { value: 'islamic-school', label: 'Islamic school' },
  { value: 'msa-university', label: 'MSA / university' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'conference', label: 'Conference' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'legal-association', label: 'Law firm / legal association' },
  { value: 'other', label: 'Other' },
] as const;

export const ENGAGEMENT_TYPES = [
  { value: 'keynote', label: 'Keynote' },
  { value: 'motivational-talk', label: 'Motivational talk' },
  { value: 'khutbah', label: "Jumu'ah khutbah" },
  { value: 'workshop', label: 'Workshop' },
  { value: 'fundraiser', label: 'Fundraiser / banquet' },
  { value: 'panel', label: 'Panel' },
  { value: 'youth-program', label: 'Youth program' },
] as const;

export const FORMATS = [
  { value: 'in-person', label: 'In person' },
  { value: 'virtual', label: 'Virtual' },
] as const;

/** Preset speaker topics (spec §5) + open option. */
export const TOPICS = [
  { value: 'beautiful-patience', label: 'Beautiful Patience (sabr)' },
  {
    value: 'keep-your-hands-up',
    label: 'Keep Your Hands Up (faith, discipline, never quitting)',
  },
  { value: 'fajr-first', label: 'Fajr First' },
  {
    value: 'unreasonable-hospitality',
    label: 'Unreasonable Hospitality — Islamic edition (ihsan)',
  },
  {
    value: 'facts-inform-stories-transform',
    label: 'Facts Inform, Stories Transform (Palestinian memory)',
  },
  { value: 'muslim-professional', label: 'The Muslim Professional' },
  { value: 'other', label: "Other / let's discuss" },
] as const;

export const AUDIENCE_SIZES = [
  { value: 'under-50', label: 'Under 50' },
  { value: '50-150', label: '50–150' },
  { value: '150-500', label: '150–500' },
  { value: '500-plus', label: '500+' },
  { value: 'unknown', label: 'Not sure yet' },
] as const;

export const AGE_RANGES = [
  { value: 'youth', label: 'Youth / teens' },
  { value: 'college', label: 'College age' },
  { value: 'adults', label: 'Adults' },
  { value: 'mixed', label: 'Mixed / all ages' },
] as const;

export const BUDGET_RANGES = [
  { value: 'undisclosed', label: 'Prefer not to say yet' },
  { value: 'under-1k', label: 'Under $1,000' },
  { value: '1k-2.5k', label: '$1,000 – $2,500' },
  { value: '2.5k-5k', label: '$2,500 – $5,000' },
  { value: '5k-plus', label: '$5,000+' },
  { value: 'community', label: 'Community / volunteer request' },
] as const;

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((o) => o.value) as [T[number]['value'], ...T[number]['value'][]];

export const speakerRequestSchema = z
  .object({
    orgName: z.string().trim().min(2, 'Organization name is required').max(200),
    orgType: z.enum(values(ORG_TYPES)),
    contactName: z.string().trim().min(2, 'Contact name is required').max(120),
    contactRole: z.string().trim().max(120).optional().or(z.literal('')),
    contactEmail: z.string().trim().email('A valid email is required').max(254),
    contactPhone: z
      .string()
      .trim()
      .min(7, 'A valid phone number is required')
      .max(30)
      .regex(/^[+()\-.\s\d]+$/, 'A valid phone number is required'),
    eventName: z.string().trim().min(2, 'Event name is required').max(200),
    eventDates: z.string().trim().max(200).optional().or(z.literal('')),
    dateFlexible: z.coerce.boolean().optional(),
    format: z.enum(values(FORMATS)),
    location: z.string().trim().max(200).optional().or(z.literal('')),
    engagementType: z.enum(values(ENGAGEMENT_TYPES)),
    audienceSize: z.enum(values(AUDIENCE_SIZES)),
    audienceAge: z.enum(values(AGE_RANGES)),
    audienceDescription: z.string().trim().max(1000).optional().or(z.literal('')),
    topic: z.enum(values(TOPICS)),
    budget: z.enum(values(BUDGET_RANGES)).optional(),
    notes: z.string().trim().max(3000).optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (
      data.format === 'in-person' &&
      !(data.location && data.location.length >= 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['location'],
        message: 'City and state are required for in-person events',
      });
    }
    if (!data.dateFlexible && !(data.eventDates && data.eventDates.length >= 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['eventDates'],
        message: 'Provide a date (or mark the date as flexible)',
      });
    }
  });

export type SpeakerRequest = z.infer<typeof speakerRequestSchema>;

const label = (
  list: readonly { value: string; label: string }[],
  value: string | undefined,
) => list.find((o) => o.value === value)?.label ?? value ?? '—';

/** Human-readable summary lines for emails / CRM payloads. */
export function describeRequest(r: SpeakerRequest): [string, string][] {
  return [
    ['Organization', `${r.orgName} (${label(ORG_TYPES, r.orgType)})`],
    [
      'Contact',
      `${r.contactName}${r.contactRole ? `, ${r.contactRole}` : ''} · ${r.contactEmail} · ${r.contactPhone}`,
    ],
    ['Event', r.eventName],
    [
      'Date(s)',
      `${r.eventDates || '—'}${r.dateFlexible ? ' (flexible)' : ''}`,
    ],
    [
      'Format',
      `${label(FORMATS, r.format)}${r.format === 'in-person' ? ` — ${r.location}` : ''}`,
    ],
    ['Engagement', label(ENGAGEMENT_TYPES, r.engagementType)],
    [
      'Audience',
      `${label(AUDIENCE_SIZES, r.audienceSize)} · ${label(AGE_RANGES, r.audienceAge)}${r.audienceDescription ? ` · ${r.audienceDescription}` : ''}`,
    ],
    ['Topic', label(TOPICS, r.topic)],
    ['Budget', label(BUDGET_RANGES, r.budget)],
    ['Notes', r.notes || '—'],
  ];
}
