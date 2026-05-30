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

const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
const usePostgres = postgresUrl.startsWith('postgres')

const db = usePostgres
  ? postgresAdapter({
      pool: {
        connectionString: postgresUrl,
      },
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
      clientUploads: true,
    }),
  )
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
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
