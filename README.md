# smolish-downloader

A tiny web app for downloading videos from [smolish.com](https://smolish.com).
Paste a link like `https://smolish.com/v/4549984250757120` and get a preview,
the MP4, and the thumbnail.

## How it works

Smolish serves every video from a predictable CDN path:

```
https://cdn.smolish.com/videos/<id>/1080p.mp4
https://cdn.smolish.com/videos/<id>/thumb.jpg
```

The page extracts the numeric id from the link and builds those URLs.

The CDN does not send CORS headers, so a purely static page cannot force a
"save as" download with a nice filename. That is what the optional Vercel
functions in `api/` are for:

| Endpoint | What it does |
| --- | --- |
| `GET /api/info?url=<link or id>` | Scrapes the page's OpenGraph tags (author, stats, video URL, size) |
| `GET /api/download?url=<link or id>&name=<file>` | Streams the MP4 from `cdn.smolish.com` with `Content-Disposition: attachment` |

The functions only ever fetch `smolish.com` / `cdn.smolish.com`, so they can't
be used as an open proxy.

You can link straight to a video with `?v=<id>`, e.g. `/?v=4549984250757120`.

## Deploy

### Vercel (recommended — one-click downloads)

Import the repo in Vercel (no build settings needed) or run:

```sh
npx vercel
```

`index.html` is served as the static site and `api/*.js` become Edge Functions.

### GitHub Pages (static only)

Settings → Pages → Deploy from branch → `main` / root.

Without the API, the page falls back to linking the CDN file directly. Preview
and playback work; the Download button opens the MP4, which you can save with
right-click → "Save video as…" (long-press on mobile).

## Disclaimer

Not affiliated with Smolish. Only download videos you have the right to save.
