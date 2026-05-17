# iGEM Toronto 2026 Wiki

Built with Gatsby, React, Styled Components, and an MDX content pipeline for team-authored wiki pages.

## Prerequisites

- Node.js 20 recommended. GitHub Actions builds with Node 20.
- npm, installed with Node.
- Git.

If you use `nvm`, run:

```bash
nvm use
```

## Getting Started

```bash
npm ci
npm run develop
```

Open `http://localhost:8000`.

## Useful Commands

| Command | What it does |
| --- | --- |
| `npm run develop` | Start the local Gatsby dev server. |
| `npm run validate:content` | Check MDX frontmatter, route collisions, and nav links. |
| `npm run build` | Validate content and build the production site. |
| `npm run build:gatsby` | Run Gatsby build without the content validation wrapper. |
| `npm run serve` | Preview the production build locally. |
| `npm run clean` | Clear Gatsby cache. |

## Project Structure

```text
src/
  components/          Shared React components and MDX blocks
  content/wiki/        Author-editable MDX wiki pages
  data/                CSV and JS data sources
  pages/               React-only routes and interactive pages
  styles/              Global design tokens and base styles
  templates/           Gatsby page templates for generated content
scripts/
  validate-content.mjs MDX content and route validation
docs/
  content-authoring.md Author guide for subteams
```

Most text-heavy wiki pages now live in `src/content/wiki/**/index.mdx`. The homepage, team CSV page, and interactive Dry Lab atlas remain React pages in `src/pages`.

## Writing Wiki Content

Start with `docs/content-authoring.md`. It explains the required frontmatter, approved MDX components, image conventions, and pull request checklist.

Use `src/content/wiki/_template.mdx` as the starter for new pages.

## Contributing

1. Never push directly to `main`.
2. Create a branch for your work.
3. Edit code or MDX content.
4. Run `npm run validate:content`.
5. Run `npm run build`.
6. Open a pull request.

_iGEM Toronto 2026 - University of Toronto_
