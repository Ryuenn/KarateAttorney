/**
 * Cloudflare Turnstile server-side verification (spec §5).
 * If TURNSTILE_SECRET_KEY is not configured (local dev), verification is
 * skipped and a warning is logged — production must set both keys.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  token: string | null,
  remoteIp?: string,
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn(
      '[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification (dev only)',
    );
    return { ok: true };
  }
  if (!token) return { ok: false, reason: 'missing-token' };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set('remoteip', remoteIp);
    const res = await fetch(VERIFY_URL, { method: 'POST', body });
    const data = (await res.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };
    return data.success
      ? { ok: true }
      : { ok: false, reason: data['error-codes']?.join(',') ?? 'failed' };
  } catch (err) {
    console.error('[turnstile] verification request failed', err);
    // Fail closed: a spam-check outage should not open the gate.
    return { ok: false, reason: 'verify-unreachable' };
  }
}
