# Vercel CMS 404 Fix (deploy green, all routes 404)

If Payload CMS deploys successfully but `/` and `/admin` show Vercel `404 NOT_FOUND`, the CMS project is almost always serving **static files** instead of **Next.js**.

## Root cause (fixed in repo)

The repo root had `vercel.json` with `"outputDirectory": "public"` for the **Gatsby wiki**. Vercel monorepos often merge that into **every** project from the same repo — including the CMS — so the CMS never runs Next.js.

That file was removed from the repo root. Wiki settings now live in `vercel.wiki.json` (reference only — configure manually in the wiki Vercel project).

## Fix your existing CMS project (5 minutes)

1. **Delete the CMS Vercel project** and create a new one (fastest), **OR** fix settings below.

2. **Settings → General** (CMS project only):
   - Root Directory: `cms/payload-app`
   - Framework: **Next.js**
   - Output Directory: **empty** (not `public`, not `.next`)
   - Node.js: **20.x**

3. **Storage**: Postgres + Blob connected to **this** project.

4. **Environment variables**:
   - `PAYLOAD_SECRET`
   - `POSTGRES_URL` (auto from Postgres)
   - `BLOB_READ_WRITE_TOKEN` (auto from Blob)
   - `PAYLOAD_PUBLIC_SERVER_URL` = `https://your-cms-url.vercel.app`

5. **Redeploy** with **clear build cache**.

6. Test: `https://your-cms-url.vercel.app/api/health`  
   Must return: `{"ok":true,"service":"payload-cms"}`

## Deploy CMS via CLI (bypasses dashboard mistakes)

```bash
cd cms/payload-app
npm ci
npx vercel login
npx vercel link
npx vercel env pull .env.local
# Add PAYLOAD_SECRET etc. in Vercel dashboard first, then pull again
npx vercel --prod
```

Use the URL the CLI prints. Open `/admin` on that URL.

## Wiki project (separate Vercel project)

When you create the **wiki** project (repo root `.`), set manually:

| Setting | Value |
|---------|--------|
| Framework | Other |
| Build | `npm run build:demo` |
| Output | `public` |
| Install | `npm ci && npm --prefix cms/payload-app ci` |

See `vercel.wiki.json` in the repo for reference.

## Still broken?

Paste from the **CMS** deployment build log:

1. The line that shows the build command (`next build` vs `build:demo`)
2. Whether **Functions** tab lists routes like `/admin/[[...segments]]`
3. The exact URL you open in the browser
