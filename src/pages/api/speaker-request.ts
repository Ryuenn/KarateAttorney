/**
 * Speaker Request endpoint (spec §5) — the site's core conversion.
 *
 * Flow: honeypot → zod validation (never trust client input) → Turnstile
 * server verification → Resend emails (notify + confirm) → CRM webhook
 * (best-effort) → PRG redirect to the confirmation screen.
 *
 * Works for both plain HTML form posts (redirects) and fetch clients
 * (JSON), so the form functions with JavaScript disabled.
 */
import type { APIRoute } from 'astro';
import { sendSpeakerRequestEmails } from '../../lib/email';
import { speakerRequestSchema } from '../../lib/speaker-request';
import { verifyTurnstile } from '../../lib/turnstile';
import { postToCrmWebhook } from '../../lib/webhook';

export const prerender = false;

const wantsJson = (request: Request) =>
  request.headers.get('accept')?.includes('application/json') ?? false;

function fail(
  request: Request,
  redirect: (path: string, status?: 301 | 302 | 303 | 307 | 308) => Response,
  code: string,
  errors?: Record<string, string[]>,
): Response {
  if (wantsJson(request)) {
    return new Response(JSON.stringify({ ok: false, code, errors }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  return redirect(`/speaking?error=${encodeURIComponent(code)}#request`, 303);
}

export const POST: APIRoute = async ({ request, redirect, clientAddress }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(request, redirect, 'bad-request');
  }

  // Honeypot: real users never fill "website". Pretend success for bots.
  if (typeof form.get('website') === 'string' && form.get('website') !== '') {
    return wantsJson(request)
      ? new Response(JSON.stringify({ ok: true }), {
          headers: { 'content-type': 'application/json' },
        })
      : redirect('/speaking/thanks', 303);
  }

  const raw = Object.fromEntries(form.entries());
  const parsed = speakerRequestSchema.safeParse({
    ...raw,
    dateFlexible: raw.dateFlexible === 'on' || raw.dateFlexible === 'true',
  });
  if (!parsed.success) {
    return fail(
      request,
      redirect,
      'validation',
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const turnstile = await verifyTurnstile(
    form.get('cf-turnstile-response') as string | null,
    clientAddress,
  );
  if (!turnstile.ok) {
    console.warn(`[speaker-request] turnstile rejected: ${turnstile.reason}`);
    return fail(request, redirect, 'turnstile');
  }

  const data = parsed.data;
  const emailResult = await sendSpeakerRequestEmails(data);
  const webhookOk = await postToCrmWebhook({
    source: 'karateattorney.com/speaker-request',
    receivedAt: new Date().toISOString(),
    ...data,
  });

  // Confirm unless literally every configured channel failed — a request
  // that reached no inbox and no CRM must not pretend success.
  if (emailResult.configured && !emailResult.notified && !webhookOk) {
    console.error('[speaker-request] all delivery channels failed');
    return fail(request, redirect, 'delivery');
  }

  return wantsJson(request)
    ? new Response(JSON.stringify({ ok: true, redirect: '/speaking/thanks' }), {
        headers: { 'content-type': 'application/json' },
      })
    : redirect('/speaking/thanks', 303);
};
