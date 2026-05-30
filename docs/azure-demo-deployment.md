# Azure Team Demo Deployment

> **Recommended:** use [vercel-demo-deployment.md](./vercel-demo-deployment.md) instead. Vercel is simpler for this Payload + Gatsby demo.

This document remains as a reference if you specifically need Azure Container Apps.

- **Payload CMS** on Azure Container Apps (team editing UI)
- **Gatsby wiki** on Azure Static Web Apps (public static site)
- **Auto-rebuild** when someone clicks **Publish** in Payload

The public wiki never calls Payload at runtime. CI pulls published content, exports MDX, builds Gatsby, and deploys static files.

## Architecture

```text
Editor publishes in Payload (Azure Container Apps)
  -> GitHub Actions repository_dispatch
  -> CI runs npm run payload:sync against hosted Payload API
  -> CI runs npm run build
  -> CI uploads public/ to Azure Static Web Apps
```

## Cost-conscious defaults

| Service | Tier | Typical demo cost |
|---------|------|-------------------|
| Azure Static Web Apps | Free | $0 |
| Azure Container Apps | Consumption, min replicas 0 | Low when idle; small charge while demo is open |
| Azure Container Registry | Basic | ~$5/mo while it exists |
| Azure Files (SQLite + media) | Standard LRS | Pennies |

**Save credits when not demoing:**

```bash
az containerapp update \
  --name igem-payload-cms \
  --resource-group igem-wiki-demo \
  --min-replicas 0 \
  --max-replicas 0
```

Turn it back on with `--min-replicas 0 --max-replicas 1` before the next demo.

## Prerequisites

- Azure subscription (student credits are fine)
- [Azure CLI](https://learn.microsoft.com/en/cli/azure/install-azure-cli) (`az login`)
- Docker Desktop
- GitHub repo admin access on your fork
- Branch: `payload-cms-prototype`

## Step 1 — GitHub secrets

In **GitHub → Settings → Secrets and variables → Actions**, add:

| Secret | Example | Purpose |
|--------|---------|---------|
| `PAYLOAD_DEMO_URL` | `https://igem-payload-cms.xxxx.canadaeast.azurecontainerapps.io` | CI export source |
| `WIKI_DEMO_URL` | `https://happy-wave-123.azurestaticapps.net` | Gatsby site URL metadata |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | from Azure portal | Deploy wiki to SWA |
| `PAYLOAD_REBUILD_WEBHOOK_SECRET` | GitHub PAT with `repo` scope | Payload → CI trigger |

Optional: create a fine-grained PAT limited to your fork with **Contents** and **Actions** read/write.

## Step 2 — Azure Static Web Apps (wiki)

1. Azure Portal → **Create Static Web App**
2. Source: **GitHub**, repo `Abdel-E/iGEM_wiki`, branch `payload-cms-prototype`
3. Build preset: **Custom**
4. App location: `/` (we upload prebuilt files from CI)
5. Skip build in portal — **`.github/workflows/demo-deploy.yml`** handles build + upload
6. Copy the **deployment token** into `AZURE_STATIC_WEB_APPS_API_TOKEN`

Note the SWA URL for `WIKI_DEMO_URL`.

## Step 3 — Deploy Payload CMS

```bash
cp infra/azure/env.example infra/azure/env.local
# Edit env.local: set AZURE_* names, PAYLOAD_SECRET, webhook vars

export PAYLOAD_SECRET="$(openssl rand -hex 32)"
export PAYLOAD_REBUILD_WEBHOOK_URL="https://api.github.com/repos/Abdel-E/iGEM_wiki/dispatches"
export PAYLOAD_REBUILD_WEBHOOK_SECRET="github_pat_..."  # PAT with repo scope

bash infra/azure/deploy-payload.sh
```

The script prints your CMS URL. Set **`PAYLOAD_DEMO_URL`** in GitHub secrets to that value.

### Payload environment (hosted)

See `cms/payload-app/.env.demo.example`. Important vars:

```env
PAYLOAD_HOSTED_DEMO=1
PAYLOAD_REBUILD_WEBHOOK_URL=https://api.github.com/repos/ORG/REPO/dispatches
PAYLOAD_REBUILD_WEBHOOK_SECRET=github_pat_...
WIKI_DEMO_URL=https://your-wiki.azurestaticapps.net
```

## Step 4 — First-time CMS setup

1. Open `https://<your-cms-url>/admin`
2. Create the first admin user
3. Seed content (pick one):
   - **Quick demo:** publish 1–2 pages manually in **Wiki → Wiki Pages**
   - **Full import:** copy your local SQLite DB to Azure Files (if you already ran `npm run payload:import-mdx` locally):

     ```bash
     az storage file upload \
       --account-name igemwikidemostore \
       --share-name payload-data \
       --source cms/payload-app/cms-payload-app.db \
       --path cms-payload-app.db
     ```

     Then restart the Container App.

## Step 5 — First wiki deploy

Either push to `payload-cms-prototype`, or run manually:

**GitHub → Actions → Demo deploy → Run workflow**

CI will:

1. Fetch published pages from hosted Payload
2. Download media into `static/payload-media/`
3. Write MDX to `src/content/wiki/_payload-export/`
4. Build Gatsby
5. Upload `public/` to Azure Static Web Apps

## Step 6 — Demo the full loop

1. Editor opens Payload admin → edits a wiki page → **Publish**
2. Payload calls GitHub `repository_dispatch`
3. GitHub Actions rebuilds and deploys the wiki (~5–10 min)
4. Team views the updated site at the SWA URL

## Local development (unchanged)

```bash
# Terminal 1
npm run payload:develop

# Terminal 2
npm run develop
```

Local publish still runs `npm run payload:export` directly. Hosted mode (`PAYLOAD_HOSTED_DEMO=1`) skips local export and only triggers CI.

## Payload config notes

The current Payload setup is sufficient for the demo:

- **Wiki Pages** collection with rich text, callout, figure, markdown blocks
- Export to MDX via `scripts/export-payload-content.mjs`
- Media copied to static files for iGEM-safe hosting
- Admin UI customization can come later — not required for the demo

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Admin blank / slow first load | Wait 30–60s for webpack; use incognito |
| CI export fails | Check `PAYLOAD_DEMO_URL` secret; ensure pages are **published** |
| Publish doesn't rebuild wiki | Verify `PAYLOAD_REBUILD_WEBHOOK_*` on Container App |
| Media missing on wiki | Re-run deploy workflow; exporter now downloads from hosted Payload |
| Cold start on CMS | Normal with `min-replicas 0`; first request wakes the app |

## Files added for this demo

- `.github/workflows/demo-deploy.yml` — sync + build + Azure deploy
- `infra/azure/deploy-payload.sh` — Container Apps + persistent storage
- `cms/payload-app/.env.demo.example` — hosted env template
- `docs/azure-demo-deployment.md` — this guide

## References

- Local workflow: `docs/payload-cms-workflow.md`
- GitHub Pages variant: `docs/payload-github-pages-cicd.md`
