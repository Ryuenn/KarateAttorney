/**
 * CRM handoff webhook (spec §5): POSTs each speaker request to an n8n
 * workflow / Google Sheet bridge so requests are never lost. Best-effort by
 * design — a webhook outage must never block emails or the confirmation.
 */

export async function postToCrmWebhook(payload: unknown): Promise<boolean> {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) {
    console.warn('[webhook] CRM_WEBHOOK_URL not set — skipping CRM handoff');
    return false;
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.error(`[webhook] CRM webhook responded ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[webhook] CRM webhook failed', err);
    return false;
  }
}
