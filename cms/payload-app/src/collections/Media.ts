import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const mediaDir =
  process.env.PAYLOAD_MEDIA_DIR || path.resolve(dirname, '..', '..', 'media')

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: process.env.BLOB_READ_WRITE_TOKEN
    ? true
    : {
        staticDir: mediaDir,
      },
}
