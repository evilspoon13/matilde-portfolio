import { getSignedFileUrl } from '@/lib/notion';

/**
 * Serves a Notion-hosted file under a stable URL.
 *
 * Notion re-signs its S3 URLs on every database query, which means next/image
 * (which caches by src URL) never gets a cache hit and re-downloads plus
 * re-transcodes every image for every visitor. This route keys off the S3 path
 * instead, re-signs server-side, and returns an immutable response so both
 * next/image and the CDN can cache it. Replacing a file in Notion changes its
 * path, so the URL changes with it.
 *
 * The key is resolved against the files actually referenced by our own Notion
 * databases, so this cannot be used to proxy arbitrary URLs.
 */

const IMMUTABLE = 'public, max-age=31536000, s-maxage=31536000, immutable';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key: segments } = await params;
  const key = segments.join('/');

  try {
    let signedUrl = await getSignedFileUrl(key);
    if (!signedUrl) {
      // Not in the cached index — it may be a file added since the last
      // revalidation, so check once against live Notion data.
      signedUrl = await getSignedFileUrl(key, true);
    }
    if (!signedUrl) {
      return new Response('Not found', { status: 404 });
    }

    let upstream = await fetch(signedUrl, { cache: 'no-store' });

    if (!upstream.ok) {
      // Most likely an expired signature from the cached index; re-sign once.
      const freshUrl = await getSignedFileUrl(key, true);
      if (freshUrl && freshUrl !== signedUrl) {
        upstream = await fetch(freshUrl, { cache: 'no-store' });
      }
    }

    if (!upstream.ok || !upstream.body) {
      console.error(`/api/img: upstream ${upstream.status} for ${key}`);
      return new Response('Upstream error', { status: 502 });
    }

    const headers = new Headers({ 'Cache-Control': IMMUTABLE });
    const contentType = upstream.headers.get('content-type');
    const contentLength = upstream.headers.get('content-length');
    if (contentType) headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);

    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    console.error('/api/img: failed to serve', key, error);
    return new Response('Internal error', { status: 500 });
  }
}
