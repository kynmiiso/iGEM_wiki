# Payload CMS prototype

This folder holds the team's Payload CMS pilot for wiki authoring. It is kept on the `payload-cms-prototype` branch separately from `main` / `dynamic-sizing`.

## Quick start

See [docs/payload-cms-workflow.md](../docs/payload-cms-workflow.md) for the full workflow.

```bash
npm run payload:develop      # start Payload admin at http://localhost:3000/admin
npm run payload:import-mdx   # seed Wiki Pages from existing MDX
npm run payload:export       # export published pages to src/content/wiki/_payload-export/
npm run develop              # run the Gatsby wiki
```

## Layout

- `payload-app/` — Payload + Next.js CMS app (SQLite in dev)
- `../docs/payload-cms-workflow.md` — author guide
- `../docs/payload-github-pages-cicd.md` — deployment notes
- `../scripts/export-payload-content.mjs` — MDX export script
- `../src/content/wiki/_payload-export/` — exported MDX consumed by Gatsby

Do not commit `.next/`, `node_modules/`, or local `*.db` files — they are gitignored.
