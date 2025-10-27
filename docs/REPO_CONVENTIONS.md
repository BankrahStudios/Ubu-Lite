Repository Conventions

- Ignore generated artifacts and dependencies:
  - Frontend: `templates/ubu-lite-homepage/node_modules/`, `build/static/`, `.cache/`, `.eslintcache`
  - Python: `**/__pycache__/`, `*.py[cod]`
- Keep versioned assets minimal:
  - Track React `build/index.html` and `asset-manifest.json` if needed
  - Serve fingerprinted assets from `staticfiles/` (checked in) or via CDN
- Commit hygiene:
  - Avoid committing large vendor trees or caches
  - Prefer small, focused commits with clear messages
- Local dev tips:
  - `npm ci && npm run build` inside `templates/ubu-lite-homepage/`
  - Collect static files into `staticfiles/` for Django as needed

To add new ignore patterns, update root `.gitignore` and the app-level `.gitignore` under `templates/ubu-lite-homepage/` when relevant.

