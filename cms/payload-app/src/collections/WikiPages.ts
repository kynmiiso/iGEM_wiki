import type { CollectionConfig } from 'payload'
import { triggerWikiExportAfterChange, triggerWikiExportAfterDelete } from '../hooks/triggerWikiExport'

export const WikiPages: CollectionConfig = {
  slug: 'wiki-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'path', '_status', 'updated'],
    group: 'Wiki',
    livePreview: {
      url: ({ data }) => {
        const siteUrl = (process.env.WIKI_DEMO_URL || 'http://localhost:8000').replace(/\/$/, '')
        return `${siteUrl}${data?.path || '/'}`
      },
    },
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  hooks: {
    afterChange: [triggerWikiExportAfterChange],
    afterDelete: [triggerWikiExportAfterDelete],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Page',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'section',
              type: 'select',
              required: true,
              options: ['Wiki', 'Project', 'Wet Lab', 'Dry Lab', 'Hardware', 'Beyond the Bench', 'Team', 'Safety'],
            },
            {
              name: 'path',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                description: 'Use a Gatsby/iGEM route like /cms-test/. Start and end with a slash.',
              },
            },
            {
              name: 'navTitle',
              type: 'text',
              required: true,
            },
            {
              name: 'order',
              type: 'number',
              required: true,
              defaultValue: 50,
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
            },
            {
              name: 'owners',
              type: 'array',
              required: true,
              minRows: 1,
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'updated',
              type: 'date',
              required: true,
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                },
              },
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'content',
              type: 'blocks',
              required: true,
              minRows: 1,
              labels: {
                singular: 'Page Block',
                plural: 'Page Blocks',
              },
              blocks: [
                {
                  slug: 'richText',
                  labels: {
                    singular: 'Rich Text',
                    plural: 'Rich Text',
                  },
                  fields: [
                    {
                      name: 'body',
                      type: 'richText',
                      required: true,
                    },
                  ],
                },
                {
                  slug: 'callout',
                  labels: {
                    singular: 'Callout',
                    plural: 'Callouts',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                    },
                    {
                      name: 'tone',
                      type: 'select',
                      defaultValue: 'note',
                      options: ['note', 'success', 'warning'],
                    },
                    {
                      name: 'body',
                      type: 'textarea',
                      required: true,
                    },
                  ],
                },
                {
                  slug: 'figure',
                  labels: {
                    singular: 'Figure',
                    plural: 'Figures',
                  },
                  fields: [
                    {
                      name: 'image',
                      type: 'relationship',
                      relationTo: 'media',
                      admin: {
                        description:
                          'Upload or choose a Payload media item. Export will copy it into Gatsby static files.',
                      },
                    },
                    {
                      name: 'src',
                      type: 'text',
                      admin: {
                        description:
                          'Optional fallback for existing static paths such as /images/example.png. Prefer Media above.',
                      },
                    },
                    {
                      name: 'alt',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'caption',
                      type: 'textarea',
                    },
                  ],
                },
                {
                  slug: 'markdown',
                  labels: {
                    singular: 'Markdown / MDX',
                    plural: 'Markdown / MDX',
                  },
                  fields: [
                    {
                      name: 'body',
                      type: 'textarea',
                      required: true,
                      admin: {
                        description: 'Escape hatch for approved MDX snippets when a visual block is not enough.',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
