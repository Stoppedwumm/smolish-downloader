// Shared helpers for the Vercel edge functions. Files prefixed with "_" are
// not exposed as routes by Vercel.

export const CDN = 'https://cdn.smolish.com/videos';

// Accepts a full smolish.com/v/<id> URL, a CDN URL, or a bare numeric id.
export function parseId(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (/^\d{5,25}$/.test(s)) return s;
  const m = s.match(/(?:smolish\.com\/v\/|cdn\.smolish\.com\/videos\/)(\d{5,25})/i);
  return m ? m[1] : null;
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': status === 200 ? 'public, s-maxage=300' : 'no-store',
    },
  });
}

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Pulls <meta name|property="..." content="..."> pairs out of the page HTML.
export function parseMeta(html) {
  const meta = {};
  const re = /<meta\s+(?:name|property)="([^"]+)"\s+content="([^"]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    if (!(m[1] in meta)) meta[m[1]] = decode(m[2]);
  }
  return meta;
}
