import { spawn } from 'child_process'
import path from 'path'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const repoRoot = path.resolve(process.cwd(), '..', '..')
let pendingExport: NodeJS.Timeout | undefined

function isHostedDemo() {
  return (
    process.env.PAYLOAD_HOSTED_DEMO === '1' ||
    process.env.VERCEL === '1' ||
    Boolean(process.env.PAYLOAD_REBUILD_WEBHOOK_URL)
  )
}

function scheduleExport(reason: string) {
  if (process.env.PAYLOAD_SKIP_EXPORT === '1') return

  if (pendingExport) clearTimeout(pendingExport)

  pendingExport = setTimeout(() => {
    if (isHostedDemo()) {
      triggerRebuildWebhook(reason).catch((error) => {
        console.error(`[payload] Rebuild webhook failed after ${reason}:`, error)
      })
      return
    }

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

  const isGitHubDispatch = url.includes('api.github.com') && url.includes('/dispatches')

  if (isGitHubDispatch) {
    const token = process.env.PAYLOAD_REBUILD_WEBHOOK_SECRET || ''
    const authorization = token.startsWith('Bearer ') || token.startsWith('token ')
      ? token
      : `token ${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/vnd.github+json',
        authorization,
      },
      body: JSON.stringify({
        event_type: 'payload-wiki-published',
        client_payload: {
          reason,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    return
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ reason }),
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
