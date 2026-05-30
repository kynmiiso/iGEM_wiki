# Deploy the Payload CMS to Vercel (foolproof)

This is the definitive guide for the **CMS** Vercel project. Follow it exactly after
deleting the old broken Vercel projects.

> **Why the old project 404'd on every route:** Vercel deployed in ~10s without
> running the Next.js build. That happens when the project's **Root Directory** or
> **Framework** is wrong, so Vercel serves static files instead of the Next.js app.
> The code is correct — local `next build` produces `/`, `/admin`, `/api/health`.
> The fix is entirely in the project settings below.

---

## The 3 settings that MUST be right

| Setting | Required value |
|---------|----------------|
| **Root Directory** | `cms/payload-app` |
| **Framework Preset** | **Next.js** |
| **Output Directory** | **empty / default** (NOT `public`, NOT `.next`) |

If any of these is wrong, you get `404 NOT_FOUND` on every route.

---

## Method A — Dashboard (git-connected, auto-deploys on push)

1. **Vercel → Add New → Project** → import `Abdel-E/iGEM_wiki`.
2. On the configure screen, **before deploying**:
   - **Root Directory** → click **Edit** → choose `cms/payload-app`.
   - **Framework Preset** → must show **Next.js** (it should auto-detect once root is set).
   - **Build/Output/Install** → leave as the Next.js defaults (the repo's
     `cms/payload-app/vercel.json` already sets the right install + build commands).
3. **Don't deploy yet** — add storage + env vars first (next two sections), then deploy.

### Storage (this project only)

- **Storage → Create → Postgres** (Neon) → connect to this project. Injects `POSTGRES_URL`.
- **Storage → Create → Blob** → connect to this project. Injects `BLOB_READ_WRITE_TOKEN`.

### Environment variables (this project only)

| Variable | Value |
|----------|-------|
| `PAYLOAD_SECRET` | a long random string — `openssl rand -hex 32` |
| `POSTGRES_URL` | auto-added by Postgres storage |
| `BLOB_READ_WRITE_TOKEN` | auto-added by Blob storage |

`PAYLOAD_PUBLIC_SERVER_URL` is **optional now** — the config auto-detects the Vercel
URL. Set it only if you use a custom domain.

4. **Deploy.** First build takes 2–5 minutes (NOT 10 seconds). If it finishes in
   ~10s, the Root Directory/Framework is wrong — stop and fix settings.

---

## Method B — CLI prebuilt deploy (guaranteed, bypasses dashboard settings)

Use this if the dashboard keeps misbehaving. It builds **locally** and uploads the
exact output, so Root Directory can't be set wrong.

```bash
cd cms/payload-app
npm ci

# one-time: link to a NEW project (let it create one)
npx vercel link

# add env vars in the Vercel dashboard for this project first:
#   PAYLOAD_SECRET, POSTGRES_URL, BLOB_READ_WRITE_TOKEN
npx vercel env pull .env.local

# build locally, then deploy the prebuilt output
npx vercel build --prod
npx vercel deploy --prebuilt --prod
```

Open the URL the CLI prints.

---

## Verify it worked

```bash
curl -s https://YOUR-CMS-URL.vercel.app/api/health
```

- Returns `{"ok":true,"service":"payload-cms"}` → **fixed.** Open `/admin` and create
  the first admin user.
- Returns `NOT_FOUND` → the build didn't run. Re-check the 3 settings, then
  **Redeploy with "Clear build cache."**

---

## Still broken? Send these 3 things

1. The build-log line showing the command (must be `next build`, never `build:demo`).
2. Whether the deployment **Functions** tab lists `/admin/[[...segments]]`.
3. The exact URL you opened and the `/api/health` response.

---

## The wiki is a SEPARATE project

Don't try to open `/admin` on the wiki URL — it will always 404. The wiki
(repo root) is configured separately; see `docs/vercel-demo-deployment.md`
Part 2 and `vercel.wiki.json`.
