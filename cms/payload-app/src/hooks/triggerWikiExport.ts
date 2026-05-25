import { spawn } from 'child_process'
import path from 'path'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const repoRoot = path.resolve(process.cwd(), '..', '..')
let pendingExport: NodeJS.Timeout | undefined

function scheduleExport(reason: string) {
  if (process.env.PAYLOAD_SKIP_EXPORT === '1') return

  if (pendingExport) clearTimeout(pendingExport)

  pendingExport = setTimeout(() => {
    const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    const syncScript = process.env.PAYLOAD_PUBLISH_SYNC_SCRIPT || 'payload:export'
    const child = spawn(command, ['run', syncScript], {
      cwd: repoRoot,
      env: process.env,
      shell: true,
      stdio: 'inherit',
    })

    child.on('exit', (code) => {
      if (code === 0) {
        console.log(`[payload] Synced wiki export after ${reason}.`)
        triggerRebuildWebhook(reason).catch((error) => {
          console.error(`[payload] Rebuild webhook failed after ${reason}:`, error)
        })
      } else {
        console.error(`[payload] Wiki export sync failed after ${reason} with exit code ${code}.`)
      }
    })
  }, 500)
}

async function triggerRebuildWebhook(reason: string) {
  const url = process.env.PAYLOAD_REBUILD_WEBHOOK_URL

  if (!url) return

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(process.env.PAYLOAD_REBUILD_WEBHOOK_SECRET
        ? { authorization: `Bearer ${process.env.PAYLOAD_REBUILD_WEBHOOK_SECRET}` }
        : {}),
    },
    body: JSON.stringify({
      event: 'payload-wiki-published',
      reason,
    }),
  })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
}

export const triggerWikiExportAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  if (doc?._status === 'published') {
    scheduleExport(`publishing "${doc.title || doc.id}"`)
  }

  return doc
}

export const triggerWikiExportAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  scheduleExport(`deleting "${doc?.title || doc?.id || 'wiki page'}"`)

  return doc
}
