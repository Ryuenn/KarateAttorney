/**
 * General contact endpoint — the "Other" lane of the /contact triage.
 * Legal inquiries never come here (they are routed to the firm site) and
 * speaking requests use /api/speaker-request. Same protections as the
 * speaker endpoint: honeypot, zod validation, server-verified Turnstile.
 */
import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { Resend } from 'resend';
import { verifyTurnstile } from '../../lib/turnstile';

export const prerender = false;

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: z.string().trim().email('A valid email is required').max(254),
  subject: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'A message is required').max(5000),
});

const wantsJson = (request: Request) =>
  request.headers.get('accept')?.includes('application/json') ?? false;

export const POST: APIRoute = async ({ request, redirect, clientAddress }) => {
  const fail = (code: string, errors?: Record<string, string[]>) =>
    wantsJson(request)
      ? new Response(JSON.stringify({ ok: false, code, errors }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      : redirect(`/contact?error=${encodeURIComponent(code)}#contact-form`, 303);
  const succeed = () =>
    wantsJson(request)
      ? new Response(JSON.stringify({ ok: true }), {
          headers: { 'content-type': 'application/json' },
        })
      : // /contact/thanks was never built — a success used to land on a 404.
        // The form reads ?sent=1 and renders its own confirmation.
        redirect('/contact?sent=1#contact-form', 303);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail('bad-request');
  }

  if (typeof form.get('website') === 'string' && form.get('website') !== '') {
    return succeed(); // honeypot — pretend success
  }

  const parsed = contactSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) {
    return fail(
      'validation',
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const turnstile = await verifyTurnstile(
    form.get('cf-turnstile-response') as string | null,
    clientAddress,
  );
  if (!turnstile.ok) return fail('turnstile');

  const apiKey = process.env.RESEND_API_KEY;
  const to =
    process.env.CONTACT_NOTIFY_EMAIL ?? process.env.SPEAKER_NOTIFY_EMAIL;
  const data = parsed.data;

  if (!apiKey || !to) {
    console.warn('[contact] email not configured — logging message instead:');
    console.warn(JSON.stringify(data, null, 2));
    return succeed();
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from:
        process.env.SPEAKER_FROM_EMAIL ??
        'Karate Attorney Website <onboarding@resend.dev>',
      to,
      replyTo: data.email,
      subject: `Contact form: ${data.subject || 'General inquiry'}`,
      text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
    });
    if (error) {
      console.error('[contact] send failed', error);
      return fail('delivery');
    }
  } catch (err) {
    console.error('[contact] send failed', err);
    return fail('delivery');
  }

  return succeed();
};
