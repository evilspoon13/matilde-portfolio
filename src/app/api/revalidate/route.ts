import { createHmac, timingSafeEqual } from 'crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NOTION_CACHE_TAG } from '@/lib/notion';

/**
 * Notion webhook endpoint — lets content edits appear immediately instead of
 * waiting out the 10 minute ISR window.
 *
 * Setup (one time):
 *  1. Deploy, then add this URL as a webhook subscription on the integration
 *     at https://www.notion.so/profile/integrations
 *  2. Notion immediately POSTs a { verification_token } body here. The token is
 *     logged below — copy it from the Vercel runtime logs, paste it into the
 *     Notion dashboard to verify, and set it as NOTION_WEBHOOK_SECRET.
 *  3. Redeploy so the secret is live. Notion signs every later request with it.
 */

export const dynamic = 'force-dynamic';

function isValidSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;

  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(header);
  const b = Buffer.from(expected);

  // timingSafeEqual throws on length mismatch, so guard it first.
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  // Signature is computed over the exact bytes, so read the body as text first.
  const rawBody = await request.text();

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Step 1 of setup: Notion's one-off handshake, sent before a secret exists.
  if (payload?.verification_token) {
    // Single line so it stays one searchable row in the Vercel log viewer.
    console.log(
      `[notion-webhook] NOTION_WEBHOOK_SECRET=${payload.verification_token}`
    );
    return Response.json({ ok: true });
  }

  const secret = process.env.NOTION_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[notion-webhook] NOTION_WEBHOOK_SECRET is not set; rejecting event');
    return Response.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!isValidSignature(rawBody, request.headers.get('x-notion-signature'), secret)) {
    console.warn('[notion-webhook] rejected event with invalid signature');
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Drop the cached Notion responses...
  revalidateTag(NOTION_CACHE_TAG);
  // ...and the prerendered HTML that was built from them. Every page sits under
  // the root layout, which itself reads About, so this covers all of them.
  revalidatePath('/', 'layout');

  console.log(`[notion-webhook] revalidated for event: ${payload?.type ?? 'unknown'}`);

  return Response.json({
    revalidated: true,
    type: payload?.type ?? null,
    now: Date.now(),
  });
}
