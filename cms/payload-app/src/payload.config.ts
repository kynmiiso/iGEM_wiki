import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { WikiPages } from './collections/WikiPages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const rawPostgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
const usePostgres = rawPostgresUrl.startsWith('postgres')

// Hosted Postgres (Neon/Vercel) presents a self-signed cert chain that Node
// rejects by default ("self-signed certificate in certificate chain"). Force
// sslmode=no-verify in the connection string AND pass an explicit ssl option so
// verification is disabled regardless of how node-postgres merges the two. The
// connection is still TLS-encrypted; we just skip CA-chain verification.
const postgresUrl = (() => {
  if (!usePostgres) return rawPostgresUrl
  try {
    const url = new URL(rawPostgresUrl)
    url.searchParams.set('sslmode', 'no-verify')
    return url.toString()
  } catch {
    return rawPostgresUrl
  }
})()

// Resolve the public server URL.
// On Vercel, VERCEL_PROJECT_PRODUCTION_URL is the stable production domain and
// VERCEL_URL is the per-deployment domain. Falling back to these means the admin
// panel works on a fresh deploy without manually setting PAYLOAD_PUBLIC_SERVER_URL.
const serverURL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')

const db = usePostgres
  ? postgresAdapter({
      pool: {
        connectionString: postgresUrl,
        // Hosted Postgres (Neon/Vercel) presents a self-signed cert chain that
        // Node rejects by default ("self-signed certificate in certificate chain").
        // Skip chain verification for the demo; the connection is still TLS-encrypted.
        ssl: { rejectUnauthorized: false },
      },
      // Auto-sync the schema to the database on startup. Payload normally only
      // does this in development; we force it on so a fresh (empty) Vercel/Neon
      // Postgres gets its tables created without committing migration files.
      // Fine for a demo; switch to generated migrations for a hardened prod setup.
      push: true,
    })
  : sqliteAdapter({
      client: {
        url: process.env.DATABASE_URL || 'file:./cms-payload-app.db',
      },
    })

const plugins = []

if (process.env.BLOB_READ_WRITE_TOKEN) {
  plugins.push(
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Server-side uploads: the Payload function streams the file to Blob.
      // Browser-direct (clientUploads) uploads were 400ing against
      // vercel.com/api/blob; server uploads are reliable for images under the
      // ~4.5MB serverless body limit, which covers normal wiki media.
      clientUploads: false,
    }),
  )
}

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    suppressHydrationWarning: true,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, WikiPages],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db,
  sharp,
  plugins,
})
