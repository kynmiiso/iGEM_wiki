# Payload To Gatsby To GitHub Pages Workflow

This document explains the intended CMS-controlled workflow for the Payload pilot and the next steps for automatic builds on GitHub Pages.

## Goal

Payload should be the editing interface for wiki content, while Gatsby should remain the static site generator.

```text
Payload publish
-> export published CMS content to static MDX/assets
-> Gatsby builds the static website
-> GitHub Pages serves the built files
```

The public website should not call Payload at runtime. This keeps the approach compatible with the iGEM-safe static wiki model: content, pages, and media are exported before build time.

## Current Local Workflow

Use two terminals while testing locally.

Terminal 1 starts Payload:

```bash
npm run payload:develop
```

Open the CMS:

```text
http://localhost:3000/admin
```

Terminal 2 starts Gatsby:

```bash
npm run develop
```

Open the local Gatsby site:

```text
http://localhost:8000
```

If this is a fresh local Payload database, import the existing MDX pages into Payload:

```bash
npm run payload:import-mdx
```

Then edit or create a page in **Wiki > Wiki Pages**. When a page is published, Payload runs:

```bash
npm run payload:export
```

That writes static MDX into:

```text
src/content/wiki/_payload-export
```

Uploaded Payload media selected in Figure blocks is copied into:

```text
static/payload-media
```

Gatsby is configured so exported Payload pages win route conflicts. For example, if Payload exports `/project/description/`, Gatsby uses:

```text
src/content/wiki/_payload-export/project/description/index.mdx
```

instead of the older hand-written fallback:

```text
src/content/wiki/project/description/index.mdx
```

Before opening a PR or demoing the full static output, run:

```bash
npm run payload:sync
npm run build
```

## What Publish Does And Does Not Do

Clicking **Publish** in Payload updates the CMS and exports static source files.

It does not update a hosted static website by itself unless a CI/CD system rebuilds and redeploys Gatsby after the export.

For a hosted site, the complete chain should be:

```text
Payload publish
-> export content
-> CI/CD build starts
-> npm run payload:sync
-> npm run build
-> deploy Gatsby public/ to GitHub Pages
```

## Recommended GitHub Pages Setup

For the first team demo, use the safer PR-based workflow:

1. Editors publish content in Payload locally or in a shared staging Payload instance.
2. Web team runs:

   ```bash
   npm run payload:sync
   npm run build
   ```

3. Web team commits the exported files:

   ```text
   src/content/wiki/_payload-export
   static/payload-media
   ```

4. A PR is opened and reviewed.
5. Merging to `main` triggers GitHub Actions.
6. GitHub Actions builds Gatsby and deploys `public/` to GitHub Pages.

This is less magical than instant CMS deploys, but it is safer for iGEM because the site is built from committed source and bad exports can be caught in PR checks.

## More Automatic CMS Publish Setup

If the team wants the hosted website to rebuild automatically when someone clicks **Publish**, Payload must be hosted somewhere persistent. A local Payload instance on one laptop cannot trigger a team website reliably.

The future hosted setup would need:

- A hosted Payload app with a persistent database.
- Persistent media storage, or an export step that downloads media from hosted Payload into Gatsby static assets.
- A GitHub Actions workflow that can be triggered by Payload.
- GitHub repository secrets for Payload URL/API access if the API is private.
- GitHub Pages configured to deploy from GitHub Actions.

The likely publish flow would be:

```text
Editor clicks Publish in hosted Payload
-> Payload webhook calls GitHub Actions repository_dispatch or workflow_dispatch
-> GitHub Actions checks out the repo
-> GitHub Actions installs root Gatsby dependencies
-> GitHub Actions installs Payload app dependencies needed by the exporter
-> GitHub Actions runs PAYLOAD_URL=https://cms.example.org npm run payload:sync
-> GitHub Actions runs npm run build
-> GitHub Actions deploys public/ to GitHub Pages
```

This branch already has a Payload publish hook that can call a webhook URL through:

```env
PAYLOAD_REBUILD_WEBHOOK_URL=
PAYLOAD_REBUILD_WEBHOOK_SECRET=
```

The missing future work is the actual GitHub Actions workflow and the hosted-media export story.

## GitHub Actions Shape

When implementing later, the GitHub Pages workflow should probably have these jobs:

```text
validate-and-build
  checkout repo
  setup Node 20
  npm ci
  npm --prefix cms/payload-app ci
  npm run payload:sync
  npm run build
  upload public/ as GitHub Pages artifact

deploy
  deploy uploaded artifact to GitHub Pages
```

For a normal push-based staging site, trigger on:

```text
push to main
pull_request to main
workflow_dispatch
```

For a CMS-publish-triggered staging site, add:

```text
repository_dispatch
```

GitHub Pages should be configured to use **GitHub Actions** as the publishing source.

## iGEM Safety Boundary

For the final iGEM wiki, keep this rule:

```text
No runtime dependency on Payload.
```

That means:

- Do not fetch Payload content from the public wiki in the browser.
- Do not serve final images from Payload media URLs.
- Do not depend on Google Drive, YouTube, external fonts, or third-party APIs for final judged content.
- Export content and assets before the Gatsby build.
- Commit the source and build configuration required by the competition platform.

GitHub Pages is useful for team staging and demos, but final iGEM deployment should still be checked against the official iGEM wiki hosting rules before freeze.

## Recommended Next Steps

1. Decide whether GitHub Pages is only for staging/demo or also part of the team website workflow before iGEM deployment.
2. Add a GitHub Actions workflow that builds Gatsby on pushes and PRs.
3. Configure GitHub Pages to deploy from GitHub Actions.
4. Decide whether Payload will stay local for the pilot or be hosted for shared editing.
5. If Payload is hosted, update the exporter so remote media is copied into `static/payload-media` during CI.
6. Add a CMS publish trigger using `PAYLOAD_REBUILD_WEBHOOK_URL`.
7. Protect `main` so failed validation/builds block merges.
8. Set an internal content freeze before the iGEM Wiki Freeze.

## References

- GitHub Pages publishing sources: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Pages with custom GitHub Actions workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Actions workflow triggers: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows
