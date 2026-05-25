# iGEM Toronto 2026 — Wiki

Built with **Gatsby**, **Styled Components**, and **MDX**.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher — check with `node -v`
- [Git](https://git-scm.com/) — check with `git --version`

---

## Getting Started

```bash
git clone https://github.com/petadex/iGEM_wiki.git
cd iGEM_wiki
npm install
npm run develop
```

Open **http://localhost:8000** in your browser.

---

## Project Structure

```
src/
├── components/
│   ├── layout.js          ← WikiLayout shell (nav, footer, page chrome)
│   ├── WikiTopBar.js      ← Site navigation
│   └── mdx/               ← MDX shortcodes (Callout, Figure, etc.)
├── content/wiki/          ← Wiki pages as MDX (frontmatter drives routing)
├── pages/                 ← React-only routes (home, team, dry-lab map, 404)
├── styles/globalStyles.js ← Design tokens — colors, fonts, spacing
├── templates/wiki-mdx.js  ← Layout wrapper for MDX pages
└── data/                  ← Team CSV, sponsor placeholders

static/                    ← Public assets (images, favicon, home mockup layers)
scripts/validate-content.mjs ← Frontmatter + route checks (runs before build)
```

Most wiki pages live in `src/content/wiki/**/index.mdx`. Edit those files to update page content. React pages under `src/pages/` are reserved for interactive or special routes.

Use `src/content/wiki/_template.mdx` as a starting point for new MDX pages.

---

## Changing Colors & Fonts

Edit `src/styles/globalStyles.js`:

| Token            | Default          | What it is      |
| ---------------- | ---------------- | --------------- |
| `--color-bg`     | `#f0ede6`        | Page background |
| `--color-accent` | `#c8f050`        | Brand color     |
| `--color-text`   | `#0a0a0a`        | Body text       |
| `--font-display` | DM Serif Display | Headings        |
| `--font-body`    | DM Sans          | Body text       |

---

## Useful Commands

| Command                  | What it does                              |
| ------------------------ | ----------------------------------------- |
| `npm run develop`        | Start local dev server                    |
| `npm run build`          | Validate content, then build for production |
| `npm run validate:content` | Check MDX frontmatter and route collisions |
| `npm run serve`          | Preview production build locally          |
| `npm run clean`          | Clear Gatsby cache (try this if things break) |

---

## Contributing

1. Never push directly to `main`
2. Create a branch: `git checkout -b feat/your-page-name`
3. Make your changes
4. Push and open a pull request

---

_iGEM Toronto 2026 — University of Toronto_
