const express = require('express');
const router = express.Router();
const mergeService = require('../services/mergeService');

router.post('/merge', async (req, res) => {
  try {
    const { newArticles, referenceDate } = req.body;
    if (!Array.isArray(newArticles)) return res.status(400).json({ ok: false, message: 'newArticles must be array' });
    const merged = await mergeService.mergeArticles({ newArticles, referenceDate });
    res.json({ ok: true, merged });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

router.post('/export/json', async (req, res) => {
  try {
    const { dataset } = req.body;
    res.setHeader('Content-disposition', 'attachment; filename=merged-news.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(dataset, null, 2));
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

module.exports = router;
