const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const formatting = require('../utils/formatting');

const DATA_PATH = path.join(__dirname, '..', 'data', 'news-data.json');

async function loadExisting() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { articles: [], categories: [{ id: 'all', name: 'All', active: true }], makeWebhook: '', authToken: '' };
  }
}

function withinDays(dateStr, referenceDate, days) {
  const d = new Date(dateStr);
  const ref = referenceDate ? new Date(referenceDate) : new Date();
  const diff = (ref - d) / (1000 * 60 * 60 * 24);
  return diff <= days;
}

function sortNewestFirst(arr) {
  return arr.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
}

async function mergeArticles({ newArticles, referenceDate }) {
  const existing = await loadExisting();
  const refDate = referenceDate ? new Date(referenceDate) : new Date();
  // Process new articles: validate and transform
  const processed = newArticles
    .map((a) => {
      const out = { ...a };
      out.id = out.id || uuidv4();
      out.title = formatting.sanitizeTextForOutput(out.title);
      out.fullContent = formatting.makeContinuousHTML(out.fullContent || '');
      out.readTime = Math.max(1, Math.ceil((out.wordCount || (out.content ? out.content.split(/\s+/).length : 0)) / 200));
      out.isTrending = (new Date(refDate) - new Date(out.publishDate)) <= 48 * 3600 * 1000;
      out.isVideo = Array.isArray(out.videos) && out.videos.length > 0;
      out.isJob = out.type === 'job' || out.isJob === true;
      return out;
    })
    .filter((a) => {
      // Keep only those within 7 days
      const keep = (new Date(refDate) - new Date(a.publishDate)) <= 7 * 24 * 3600 * 1000;
      return keep;
    });

  // Merge categories, keeping 'all' first
  const categories = existing.categories || [{ id: 'all', name: 'All', active: true }];
  const nameSet = new Set(categories.map((c) => c.name.toLowerCase()));
  processed.forEach((p) => {
    if (p.category && !nameSet.has(p.category.toLowerCase())) {
      categories.push({ id: uuidv4(), name: p.category, active: true });
      nameSet.add(p.category.toLowerCase());
    }
  });

  const mergedArticles = sortNewestFirst([...processed, ...(existing.articles || []).filter(a => {
    // filter existing articles to be <=7 days
    return (new Date(refDate) - new Date(a.publishDate)) <= 7 * 24 * 3600 * 1000;
  })]);

  const trending = mergedArticles.filter((a) => (new Date(refDate) - new Date(a.publishDate)) <= 48 * 3600 * 1000).slice(0, 5);

  const out = {
    ...existing,
    makeWebhook: existing.makeWebhook || '',
    authToken: existing.authToken || '',
    categories,
    articles: mergedArticles,
    trending
  };

  // Write back to file
  await fs.writeFile(DATA_PATH, JSON.stringify(out, null, 2), 'utf8');
  return out;
}

module.exports = {
  mergeArticles
};
