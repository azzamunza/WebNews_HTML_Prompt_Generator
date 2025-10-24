const express = require('express');
const router = express.Router();
const imageService = require('../services/imageService');
const videoService = require('../services/videoService');
const fetch = require('node-fetch');

// Validate arbitrary URL (head or get)
router.post('/url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ ok: false, message: 'Missing url' });
  try {
    // HEAD then GET fallback
    const resp = await fetch(url, { method: 'HEAD', redirect: 'follow', timeout: 10000 });
    const status = resp.status;
    const contentType = resp.headers.get('content-type') || '';
    res.json({ ok: status >= 200 && status < 400, status, contentType });
  } catch (err) {
    res.json({ ok: false, error: String(err) });
  }
});

// Validate image: returns {ok, status, contentType, width, height, isValid}
router.post('/image', async (req, res) => {
  const { url, minWidth = 0, minHeight = 0 } = req.body;
  if (!url) return res.status(400).json({ ok: false, message: 'Missing url' });
  try {
    const info = await imageService.validateImage(url);
    const meets = info.width >= minWidth && info.height >= minHeight && /^image\//.test(info.contentType);
    res.json({ ok: meets, info });
  } catch (err) {
    res.json({ ok: false, error: String(err) });
  }
});

// Generate fallback SVG for missing image
router.post('/image/fallback', async (req, res) => {
  const { title = 'Image', width = 1200, height = 800, theme = {} } = req.body;
  try {
    const svgDataUri = imageService.generateFallbackSVG({ title, width, height, theme });
    res.json({ ok: true, svg: svgDataUri });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Validate YouTube/video url
router.post('/video', async (req, res) => {
  const { url } = req.body;
  try {
    const info = await videoService.validateVideo(url);
    res.json(info);
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

module.exports = router;
