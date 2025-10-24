const fetch = require('node-fetch');
const sizeOf = require('image-size');

async function bufferFromUrl(url, maxBytes = 5 * 1024 * 1024) {
  const resp = await fetch(url, { redirect: 'follow', timeout: 15000 });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = await resp.buffer();
  if (buf.length > maxBytes) throw new Error('Image too large');
  const contentType = resp.headers.get('content-type') || '';
  return { buffer: buf, contentType };
}

async function validateImage(url) {
  const { buffer, contentType } = await bufferFromUrl(url);
  let dims;
  try {
    dims = sizeOf(buffer);
  } catch (err) {
    throw new Error('Not a valid image');
  }
  return { url, width: dims.width, height: dims.height, type: dims.type, contentType };
}

function sanitizeForIdText(s) {
  if (!s) return 'Image';
  return s.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 30);
}

function generateFallbackSVG({ title = 'Image', width = 1200, height = 800, theme = {} }) {
  const safe = sanitizeForIdText(title);
  const primary = theme.primary || '#1f2937';
  const secondary = theme.secondary || '#4f46e5';
  const gradientId = `g-${safe}-${width}-${height}`.replace(/\s+/g, '-');
  const label = escapeXml(title);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}' preserveAspectRatio='xMidYMid slice'>
  <defs>
    <linearGradient id='${gradientId}' x1='0' x2='1' y1='0' y2='1'>
      <stop offset='0' stop-color='${primary}' stop-opacity='0.95'/>
      <stop offset='1' stop-color='${secondary}' stop-opacity='0.85'/>
    </linearGradient>
  </defs>
  <rect width='100%' height='100%' fill='url(#${gradientId})'/>
  <g fill='#ffffff' opacity='0.95'>
    <rect x='36' y='${height - 140}' rx='8' width='${width - 72}' height='104' fill='#000' opacity='0.12'/>
    <text x='60' y='${height - 80}' font-family='Arial, Helvetica, sans-serif' font-size='34' fill='#fff'>${label}</text>
  </g>
</svg>`;
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml;utf8,${svg}`;
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'\"]+/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
  });
}

module.exports = {
  validateImage,
  generateFallbackSVG
};
