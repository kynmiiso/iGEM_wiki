# Vercel Team Demo Deployment

Host a **full working demo** with two Vercel projects from this repo:

| Project | Root directory | URL example |
|---------|----------------|-------------|
| **Payload CMS** | `cms/payload-app` | `https://igem-cms.vercel.app/admin` |
| **Gatsby wiki** | `/` (repo root) | `https://igem-wiki.vercel.app` |

```text
Editor publishes in Payload (Vercel)
  → Payload hits wiki Deploy Hook
  → Vercel rebuilds wiki
  → build pulls published pages from Payload API
  → static site updates
```

The public wiki never calls Payload at runtime.

---

## Before you start

- [Vercel account](https://vercel.com) (Hobby/free is fine for demos)
- GitHub repo pushed to **`payload-cms-prototype`** branch
- Node 20 locally (for seeding content)

---

## Part 1 — Deploy Payload CMS

### 1. Import the CMS project

1. Vercel Dashboard → **Add New → Project**
2. Import `Abdel-E/iGEM_wiki` (or your fork)
3. **Root Directory:** click **Edit** → select **`cms/payload-app`** (not repo root)
4. **Framework Preset:** **Next.js** (must not be Gatsby or "Other")
5. **Output Directory:** leave **empty** (do not use `public` — that is only for the wiki project)
6. Do **not** deploy yet — add storage first

If you see `output directory "public" was not found`, the CMS project is using wiki settings. Fix: **Settings → General → Output Directory** → clear it, **Framework** → Next.js, then redeploy.

### 2. Add Postgres (Neon)

1. In the Vercel project → **Storage** → **Create Database** → **Postgres**
2. Name it e.g. `igem-cms-db`
3. Connect it to the **cms/payload-app** project
4. Vercel injects `POSTGRES_URL` automatically

### 3. Add Blob storage (media uploads)

1. Same project → **Storage** → **Create Database** → **Blob**
2. Connect to **cms/payload-app**
3. Vercel injects `BLOB_READ_WRITE_TOKEN` automatically

### 4. Set environment variables

In **cms/payload-app** → Settings → Environment Variables:

| Variable | Value |
|----------|--------|
| `PAYLOAD_SECRET` | Random string (`openssl rand -hex 32`) |
| `PAYLOAD_PUBLIC_SERVER_URL` | Your CMS URL after first deploy, e.g. `https://igem-cms.vercel.app` |

Deploy the CMS project. First deploy may take a few minutes.

### 5. Create admin user

Open `https://<your-cms-url>/admin` and create the first admin account.

First load can take 30–60 seconds while webpack compiles — use incognito if the page looks blank.

---

## Part 2 — Deploy the wiki

### 1. Import the wiki project

1. Vercel → **Add New → Project** → same GitHub repo
2. **Root Directory:** leave as **`.`** (repo root)
3. Framework: **Other** (build settings auto-read from the root `vercel.json`)
4. Build settings:
   - **Install:** `npm install --no-audit --no-fund && npm --prefix cms/payload-app install --no-audit --no-fund`
   - **Build:** `npm run build:demo`
   - **Output:** `public`

### 2. Set environment variables

| Variable | Value |
|----------|--------|
| `PAYLOAD_URL` | CMS URL, e.g. `https://igem-cms.vercel.app` |
| `GATSBY_SITE_URL` | Wiki URL after deploy, e.g. `https://igem-wiki.vercel.app` |

Deploy the wiki project.

---

## Part 3 — Connect publish → rebuild

### 1. Create a Deploy Hook on the wiki project

1. Wiki project → **Settings → Git → Deploy Hooks**
2. Create hook named `payload-publish`
3. Copy the hook URL

### 2. Add hook to Payload CMS env vars

On the **cms/payload-app** project, add:

| Variable | Value |
|----------|--------|
| `PAYLOAD_REBUILD_WEBHOOK_URL` | Deploy hook URL from step 1 |
| `WIKI_DEMO_URL` | Your wiki Vercel URL |

Redeploy the CMS project (Deployments → … → Redeploy).

### 3. Update `PAYLOAD_PUBLIC_SERVER_URL`

If the CMS URL changed, update `PAYLOAD_PUBLIC_SERVER_URL` on the CMS project to match.

---

## Part 4 — Seed wiki content into Payload

From your laptop (with repo checked out on `payload-cms-prototype`):

```bash
npm --prefix cms/payload-app install

# Pull Postgres connection string from Vercel:
# CMS project → Storage → Postgres → .env.local tab
export POSTGRES_URL="postgres://..."
export PAYLOAD_SECRET="same-as-vercel"
export PAYLOAD_SKIP_EXPORT=1

npm run payload:import-mdx
```

This loads your existing MDX pages into Payload as **drafts**. Publish the ones you want on the demo site.

---

## Part 5 — Demo the full loop

1. Open Payload admin → **Wiki → Wiki Pages**
2. Edit a page → **Publish**
3. Payload calls the wiki Deploy Hook
4. Vercel rebuilds the wiki (~3–8 min)
5. Open the wiki URL — published content appears

---

## Local development (unchanged)

```bash
# Terminal 1 — CMS (SQLite locally, no Blob token needed)
npm run payload:develop

# Terminal 2 — wiki
npm run develop
```

Local publish still exports MDX directly. On Vercel, publish triggers the wiki deploy hook instead.

---

## Cost notes

| Service | Typical demo cost |
|---------|-------------------|
| Vercel Hobby | $0 for two projects |
| Neon Postgres (via Vercel Storage) | Free tier covers demos |
| Vercel Blob | Free tier covers small media |

Pause demos by not publishing; no need to delete projects between meetings.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CMS deploy green but **404 on every route** | See **`docs/vercel-cms-fix.md`** — usually Output Directory = `public` on the CMS project |
| CMS admin blank / slow | Wait 60s; hard refresh; try incognito |
| Wiki build fails on export | Check `PAYLOAD_URL` on wiki project; ensure pages are **published** |
| Publish doesn't rebuild wiki | Verify `PAYLOAD_REBUILD_WEBHOOK_URL` on CMS project |
| Media missing on wiki | Re-publish page; exporter downloads from hosted Payload API |
| Import fails locally | Match `PAYLOAD_SECRET` and `POSTGRES_URL` to Vercel values |

---

## Files for this setup

- `cms/payload-app/src/payload.config.ts` — Postgres + Vercel Blob on Vercel, SQLite locally
- `cms/payload-app/vercel.json` — CMS build settings
- `vercel.json` — wiki build settings (auto-read by the wiki project, root dir `.`)
- `docs/vercel-cms-fix.md` — CMS 404 troubleshooting
- `scripts/export-payload-content.mjs` — pulls published content + remote media

---

## Azure alternative

If you later need Azure instead, see `docs/azure-demo-deployment.md`. Vercel is recommended for this demo.
