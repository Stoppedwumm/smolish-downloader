import { CDN, parseId, json, parseMeta } from './_smolish.js';

export const config = { runtime: 'edge' };

// GET /api/info?url=<smolish link or id>
// Returns metadata scraped from the video page's OpenGraph / Twitter tags.
export default async function handler(request) {
  const id = parseId(new URL(request.url).searchParams.get('url'));
  if (!id) return json({ error: 'Not a valid Smolish video link or id.' }, 400);

  const pageUrl = `https://smolish.com/v/${id}`;
  let meta = {};
  try {
    const res = await fetch(pageUrl, { headers: { 'user-agent': 'Mozilla/5.0 (smolish-downloader)' } });
    if (res.status === 404) return json({ error: 'Video not found.' }, 404);
    if (res.ok) meta = parseMeta(await res.text());
  } catch {
    // Fall through to the predictable CDN paths below.
  }

  const title = (meta['og:title'] || '').replace(/\s*·\s*Smolish\s*$/, '').trim();
  return json({
    id,
    pageUrl,
    title: title || null,
    author: meta['author'] || meta['twitter:data1'] || null,
    username: meta['profile:username'] || null,
    stats: meta['og:description'] || null,
    video: meta['og:video'] || `${CDN}/${id}/1080p.mp4`,
    width: Number(meta['og:video:width']) || null,
    height: Number(meta['og:video:height']) || null,
    thumbnail: meta['og:image'] || `${CDN}/${id}/thumb.jpg`,
  });
}
