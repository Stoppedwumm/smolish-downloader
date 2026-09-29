import { CDN, parseId, json } from './_smolish.js';

export const config = { runtime: 'edge' };

// GET /api/download?url=<smolish link or id>[&quality=1080p][&name=file]
// Streams the MP4 from the Smolish CDN with a Content-Disposition header so the
// browser saves it instead of playing it. Only cdn.smolish.com is ever fetched.
export default async function handler(request) {
  const params = new URL(request.url).searchParams;
  const id = parseId(params.get('url') || params.get('id'));
  if (!id) return json({ error: 'Not a valid Smolish video link or id.' }, 400);

  const quality = /^\d{3,4}p$/.test(params.get('quality') || '') ? params.get('quality') : '1080p';
  const name = (params.get('name') || `smolish-${id}`).replace(/[^\w.\- ]+/g, '_').slice(0, 100);

  const headers = { 'user-agent': 'Mozilla/5.0 (smolish-downloader)' };
  const range = request.headers.get('range');
  if (range) headers.range = range;

  const upstream = await fetch(`${CDN}/${id}/${quality}.mp4`, { headers });
  if (!upstream.ok) {
    return json({ error: `Video not available (CDN returned ${upstream.status}).` }, upstream.status === 404 ? 404 : 502);
  }

  const out = new Headers({
    'content-type': 'video/mp4',
    'content-disposition': `attachment; filename="${name}.mp4"`,
    'access-control-allow-origin': '*',
    'cache-control': 'public, max-age=3600',
  });
  for (const h of ['content-length', 'content-range', 'accept-ranges', 'last-modified', 'etag']) {
    const v = upstream.headers.get(h);
    if (v) out.set(h, v);
  }
  return new Response(upstream.body, { status: upstream.status, headers: out });
}
