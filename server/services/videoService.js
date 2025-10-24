const fetch = require('node-fetch');
const YT_REGEX = /(?:youtube\.com\/.*v=|youtu\.be\/)([A-Za-z0-9_-]{11})/;

async function validateVideo(url) {
  if (!url) return { ok: false, reason: 'missing' };
  const m = url.match(YT_REGEX);
  if (m) {
    const id = m[1];
    const thumb = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    try {
      const resp = await fetch(thumb, { method: 'HEAD', timeout: 10000 });
      const ok = resp.ok && resp.headers.get('content-type') && resp.headers.get('content-type').startsWith('image/');
      return { ok, type: 'youtube', id, thumbnail: thumb };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
  // Fallback: check the URL returns a playable video content-type
  try {
    const resp = await fetch(url, { method: 'HEAD', timeout: 10000, redirect: 'follow' });
    const ct = resp.headers.get('content-type') || '';
    if (ct.startsWith('video/')) {
      return { ok: true, type: 'hosted', contentType: ct };
    }
    return { ok: false, type: 'unknown', contentType: ct };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

module.exports = {
  validateVideo
};
