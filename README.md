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
| `npm run payload:develop` | Start the local Payload CMS at `http://localhost:3000/admin`. |
| `npm run payload:import-mdx` | Import existing MDX wiki pages into Payload as CMS drafts for demo/editing. |
| `npm run payload:export` | Export published Payload wiki pages to static MDX. |
| `npm run payload:sync` | Export Payload pages and run content validation. |

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

## Payload CMS Pilot

Payload is being tested as a visual authoring layer for wiki content. See `docs/payload-cms-workflow.md` for the start-to-finish workflow and `docs/payload-github-pages-cicd.md` for the proposed GitHub Pages CI/CD path. Existing MDX wiki pages can be imported into Payload as drafts for the branch demo. When a Payload page is published, it exports to static MDX and Gatsby uses that export for the route, even if an older hand-written MDX page still exists as a fallback. The public iGEM wiki does not depend on a live CMS.

## Contributing

1. Never push directly to `main`.
2. Create a branch for your work.
3. Edit code or MDX content.
4. Run `npm run validate:content`.
5. Run `npm run build`.
6. Open a pull request.

_iGEM Toronto 2026 - University of Toronto_
