# Payload CMS prototype

This folder holds the team's Payload CMS pilot for wiki authoring. It lives on the `payload-cms-prototype` branch separately from `main` / `dynamic-sizing`.

## Hosted demo (Vercel)

See **[docs/vercel-demo-deployment.md](../docs/vercel-demo-deployment.md)** for the full setup guide (two Vercel projects: CMS + wiki).

## Local quick start

See [docs/payload-cms-workflow.md](../docs/payload-cms-workflow.md).

```bash
npm run payload:develop      # http://localhost:3000/admin
npm run payload:import-mdx   # seed Wiki Pages from existing MDX
npm run payload:export       # export published pages to src/content/wiki/_payload-export/
npm run develop              # Gatsby wiki at http://localhost:8000
```

## Layout

- `payload-app/` — Payload + Next.js CMS app
- `../docs/payload-cms-workflow.md` — author guide
- `../scripts/export-payload-content.mjs` — MDX export script
- `../src/content/wiki/_payload-export/` — exported MDX consumed by Gatsby

Local dev uses SQLite. Vercel uses Postgres + Blob storage (configured automatically).
