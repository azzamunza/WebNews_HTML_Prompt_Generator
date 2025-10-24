````markdown
```markdown
# Magazine JSON Editor

A full-stack web app for editing and generating magazine-style JSON articles ready for Google Docs.

Features
- Load Prompt Document (Prompt 2) as the base specification.
- Per-article editor: edit title, author, category, subCategory, date, media, takeaways, flags.
- Media validation endpoints (image, URL, YouTube).
- Generate SVG fallbacks for missing images.
- Convert special characters to HTML entities (Australian English).
- Merge modified articles with existing dataset, preserving makeWebhook & authToken.
- Export final JSON (and optional Google Docs export).
- Dashboard for trending, validation summary, QC checklist.

Quick start
1. Install dependencies:
   - root: npm install
   - client: cd client && npm install

2. Start dev server:
   - npm run dev

3. Open client at provided Vite URL.

Notes
- Backend exposes endpoints for validation and merge in server/.
- Place an existing news-data.json in server/data/news-data.json to let the merge endpoint operate.
- Configure Google Docs credentials in server/.env for Docs export (optional).
```
````