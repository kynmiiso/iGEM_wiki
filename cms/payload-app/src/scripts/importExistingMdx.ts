import fs from 'fs'
import path from 'path'
import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

type Frontmatter = {
  title?: string
  section?: string
  path?: string
  navTitle?: string
  order?: number
  description?: string
  owners?: string[]
  updated?: string
  status?: 'draft' | 'review' | 'published'
}

type ImportablePage = {
  body: string
  filePath: string
  frontmatter: Frontmatter
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const appRoot = path.resolve(dirname, '..', '..')
const repoRoot = path.resolve(appRoot, '..', '..')
const contentRoot = path.join(repoRoot, 'src', 'content', 'wiki')

loadEnv({ path: path.join(appRoot, '.env') })
process.env.PAYLOAD_SKIP_EXPORT = '1'

const { default: config } = await import('../payload.config')
const payload = await getPayload({ config })
const pages = findMdxFiles(contentRoot)
  .filter((filePath) => !relativeToContent(filePath).split(path.sep).some((part) => part.startsWith('_')))
  .map(readPage)
  .filter((page): page is ImportablePage => Boolean(page?.frontmatter.path))

let created = 0
let updated = 0

for (const page of pages) {
  const { body, frontmatter } = page
  const owners = (frontmatter.owners || []).map((name) => ({ name }))
  const draft = frontmatter.status !== 'published'

  const data = {
    title: frontmatter.title,
    section: frontmatter.section,
    path: frontmatter.path,
    navTitle: frontmatter.navTitle,
    order: frontmatter.order,
    description: frontmatter.description,
    owners,
    updated: frontmatter.updated,
    content: [
      {
        blockType: 'markdown',
        body: body.trim() || `Content placeholder imported from ${relativeToRepo(page.filePath)}.`,
      },
    ],
  } as any

  const existing = await payload.find({
    collection: 'wiki-pages',
    depth: 0,
    draft: true,
    limit: 1,
    overrideAccess: true,
    where: {
      path: {
        equals: frontmatter.path,
      },
    },
  })

  if (existing.docs[0]) {
    if (draft) {
      await payload.update({
        id: existing.docs[0].id,
        collection: 'wiki-pages',
        data,
        draft: true,
        overrideAccess: true,
      })
    } else {
      await payload.update({
        id: existing.docs[0].id,
        collection: 'wiki-pages',
        data,
        draft: false,
        overrideAccess: true,
      })
    }
    updated += 1
  } else {
    if (draft) {
      await payload.create({
        collection: 'wiki-pages',
        data,
        draft: true,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'wiki-pages',
        data,
        draft: false,
        overrideAccess: true,
      })
    }
    created += 1
  }
}

console.log(`Imported ${pages.length} MDX page(s) into Payload (${created} created, ${updated} updated).`)
console.log('Draft MDX pages stay as Payload drafts, so they will not export or collide with existing Gatsby routes.')
process.exit(0)

function findMdxFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return []

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) return findMdxFiles(entryPath)
    if (entry.isFile() && entry.name === 'index.mdx') return [entryPath]
    return []
  })
}

function readPage(filePath: string): ImportablePage | null {
  const source = fs.readFileSync(filePath, 'utf8')
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)

  if (!match) {
    console.warn(`Skipping ${relativeToRepo(filePath)} because it has no frontmatter.`)
    return null
  }

  return {
    body: source.slice(match[0].length),
    filePath,
    frontmatter: parseFrontmatter(match[1]),
  }
}

function parseFrontmatter(source: string): Frontmatter {
  const frontmatter: Record<string, unknown> = {}

  for (const line of source.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue

    const separator = line.indexOf(':')
    if (separator === -1) continue

    const key = line.slice(0, separator).trim()
    const value = parseValue(line.slice(separator + 1))
    frontmatter[key] = value
  }

  return frontmatter as Frontmatter
}

function parseValue(rawValue: string): string | number | string[] {
  const value = rawValue.trim()

  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim()
    if (!inner) return []
    return inner
      .split(',')
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean)
  }

  if (/^\d+$/.test(value)) return Number(value)

  return stripQuotes(value)
}

function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, '')
}

function relativeToContent(filePath: string): string {
  return path.relative(contentRoot, filePath)
}

function relativeToRepo(filePath: string): string {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/')
}
