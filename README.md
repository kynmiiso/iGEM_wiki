# iGEM Toronto 2026 — Wiki

Built with **Gatsby**, **Styled Components**, **MDX**, and an optional **Payload CMS** pilot for visual editing.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20 recommended
- [Git](https://git-scm.com/)

If you use `nvm`:

```bash
nvm use
```

---

## Getting Started

```bash
git clone https://github.com/petadex/iGEM_wiki.git
cd iGEM_wiki
npm install
npm run develop
```

Open **http://localhost:8000**

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
├── styles/globalStyles.js ← Design tokens
├── templates/wiki-mdx.js  ← Layout wrapper for MDX pages
└── data/                  ← Team CSV, sponsor placeholders

cms/payload-app/           ← Payload CMS (optional authoring UI)
scripts/validate-content.mjs
docs/vercel-demo-deployment.md  ← Hosted team demo guide
```

Most wiki pages live in `src/content/wiki/**/index.mdx`. Use `src/content/wiki/_template.mdx` for new pages.

---

## Useful Commands

| Command | What it does |
| --- | --- |
| `npm run develop` | Start local Gatsby dev server |
| `npm run build` | Validate content, then build for production |
| `npm run validate:content` | Check MDX frontmatter and route collisions |
| `npm run serve` | Preview production build locally |
| `npm run clean` | Clear Gatsby cache |
| `npm run payload:develop` | Payload admin at http://localhost:3000/admin |
| `npm run payload:import-mdx` | Import existing MDX into Payload |
| `npm run payload:export` | Export published Payload pages to MDX |
| `npm run payload:sync` | Export + validate |
| `npm run build:demo` | Sync from hosted Payload + Gatsby build (Vercel) |

---

## Payload CMS & Vercel demo

See `docs/payload-cms-workflow.md` (local) and **`docs/vercel-demo-deployment.md`** (hosted demo).

---

## Contributing

1. Never push directly to `main`
2. Create a branch for your work
3. Run `npm run validate:content` and `npm run build`
4. Open a pull request

---

_iGEM Toronto 2026 — University of Toronto_
