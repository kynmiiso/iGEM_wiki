/**
 * Re-register local media files in Payload's Media collection.
 *
 * Scans cms/payload-app/media/ and static/payload-media/ for image files and
 * creates a `media` document for any file that does not already exist in the
 * collection (matched by filename). When BLOB_READ_WRITE_TOKEN is set, Payload
 * uploads the file to Vercel Blob; otherwise it stays in the local media dir.
 *
 * Alt text defaults to a humanized filename ("wet-lab_gel-01.png" ->
 * "wet lab gel 01"). Edit alt text in the admin UI afterwards where needed.
 *
 * Usage: npm run import:media (from cms/payload-app), or
 *        npm run payload:import-media (from the repo root)
 */
import fs from 'fs'
import path from 'path'
import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const appRoot = path.resolve(dirname, '..', '..')
const repoRoot = path.resolve(appRoot, '..', '..')

loadEnv({ path: path.join(appRoot, '.env') })
process.env.PAYLOAD_SKIP_EXPORT = '1'

const mediaDirs = [
  process.env.PAYLOAD_MEDIA_DIR || path.join(appRoot, 'media'),
  path.join(repoRoot, 'static', 'payload-media'),
]

const allowedExtensions = new Set([
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp',
])

const files = new Map<string, string>()

for (const directory of mediaDirs) {
  if (!fs.existsSync(directory)) continue

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    if (!allowedExtensions.has(path.extname(entry.name).toLowerCase())) continue
    if (!files.has(entry.name)) files.set(entry.name, path.join(directory, entry.name))
  }
}

if (files.size === 0) {
  console.log('No media files found to import.')
  process.exit(0)
}

const { default: config } = await import('../payload.config')
const payload = await getPayload({ config })

let created = 0
let skipped = 0

for (const [name, filePath] of files) {
  const existing = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      filename: {
        equals: name,
      },
    },
  })

  if (existing.docs[0]) {
    skipped += 1
    continue
  }

  await payload.create({
    collection: 'media',
    data: {
      alt: humanizeFilename(name),
    },
    filePath,
    // Without this, importing from the local media dir (which doubles as the
    // upload staticDir when Blob storage is off) creates "name-1.ext" copies.
    overwriteExistingFiles: true,
    overrideAccess: true,
  })
  created += 1
  console.log(`Imported ${name}`)
}

console.log(
  `Media import complete: ${created} created, ${skipped} already registered (of ${files.size} file(s) found).`
)
process.exit(0)

function humanizeFilename(name: string): string {
  return path
    .basename(name, path.extname(name))
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
