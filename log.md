# MDX Wiki Workflow Log

This repo now uses an MDX content pipeline for most team-authored wiki pages. The goal is that subteams can edit content without touching React page code.

## Current Workflow

1. Authors edit files in `src/content/wiki/**/index.mdx`.
2. Each MDX file has frontmatter at the top. The most important fields are `title`, `section`, `path`, `description`, `owners`, `updated`, and `status`.
3. Gatsby reads those MDX files and creates pages from `frontmatter.path`.
4. The shared page design comes from `src/templates/wiki-mdx.js`.
5. Approved MDX components live in `src/components/mdx/wikiComponents.js`.

The old static React pages for text-heavy sections were removed to avoid route collisions. The homepage, team page, and interactive Dry Lab overview still live in `src/pages`.

## How To Check Your Work

Run this after editing MDX:

```bash
npm run validate:content
```

This checks required frontmatter, duplicate routes, React/MDX route collisions, and nav routes.

Run this before opening a pull request:

```bash
npm run build
```

This runs content validation first, then builds the Gatsby site.

For local preview:

```bash
npm run develop
```

Then open `http://localhost:8000`.

## Authoring Notes

- Use `src/content/wiki/_template.mdx` as the starter for new pages.
- Use `docs/content-authoring.md` for examples of callouts, figures, image grids, and tables.
- Put public images in `static/images` and reference them like `/images/example.png`.
- Keep `status` as `draft`, `review`, or `published`.
- Do not import arbitrary React components from MDX. Use the approved components only.

## Future CMS Note

The frontmatter fields are intentionally close to a future Strapi `wikiPage` model. If the team adds Strapi later, the page renderer should be reusable because the wiki template already expects title, path, section, status, owners, updated date, description, and body content.
