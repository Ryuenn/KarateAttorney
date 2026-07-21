/**
 * Transactional email via Resend (spec §5): a notification to Ibrahim's
 * designated inbox and a confirmation to the requester. Without
 * RESEND_API_KEY (local dev) sends are skipped and logged.
 */
import { Resend } from 'resend';
import { describeRequest, type SpeakerRequest } from './speaker-request';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function rowsHtml(request: SpeakerRequest): string {
  return describeRequest(request)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`,
    )
    .join('');
}

function rowsText(request: SpeakerRequest): string {
  return describeRequest(request)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
}

export interface EmailResult {
  notified: boolean;
  confirmed: boolean;
  configured: boolean;
}

export async function sendSpeakerRequestEmails(
  request: SpeakerRequest,
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.SPEAKER_FROM_EMAIL ??
    'Karate Attorney Website <onboarding@resend.dev>';
  const notifyTo = process.env.SPEAKER_NOTIFY_EMAIL;

  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — logging request instead:');
    console.warn(rowsText(request));
    return { notified: false, confirmed: false, configured: false };
  }

  const resend = new Resend(apiKey);
  let notified = false;
  let confirmed = false;

  if (notifyTo) {
    try {
      const { error } = await resend.emails.send({
        from,
        to: notifyTo,
        replyTo: request.contactEmail,
        subject: `Speaker request: ${request.orgName} — ${request.eventName}`,
        html: `<h2 style="font-family:Arial,sans-serif">New speaker request</h2><table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rowsHtml(request)}</table>`,
        text: `New speaker request\n\n${rowsText(request)}`,
      });
      if (error) console.error('[email] notification failed', error);
      notified = !error;
    } catch (err) {
      console.error('[email] notification failed', err);
    }
  } else {
    console.warn('[email] SPEAKER_NOTIFY_EMAIL not set — no notification sent');
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: request.contactEmail,
      subject: 'Your speaker request was received',
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6"><p>As-salamu alaykum ${esc(request.contactName)},</p><p>Thank you for inviting Ibrahim to speak at <strong>${esc(request.eventName)}</strong>. Your request has been received and someone will follow up soon.</p><p>A copy of what you submitted:</p><table style="font-size:14px;border-collapse:collapse">${rowsHtml(request)}</table><p style="color:#666;font-size:13px">If anything above is wrong, just reply to this email.</p></div>`,
      text: `As-salamu alaykum ${request.contactName},\n\nThank you for inviting Ibrahim to speak at ${request.eventName}. Your request has been received and someone will follow up soon.\n\nA copy of what you submitted:\n\n${rowsText(request)}`,
    });
    if (error) console.error('[email] confirmation failed', error);
    confirmed = !error;
  } catch (err) {
    console.error('[email] confirmation failed', err);
  }

  return { notified, confirmed, configured: true };
}
