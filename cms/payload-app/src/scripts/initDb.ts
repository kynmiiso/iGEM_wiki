/**
 * Build-time schema sync for hosted Postgres (Neon/Vercel).
 *
 * Payload's postgres adapter only auto-pushes the schema when
 * NODE_ENV !== 'production' (see @payloadcms/db-postgres/dist/connect.js).
 * On Vercel the runtime is always production, so a fresh database never gets
 * its tables and every /admin request fails with "error initializing Payload".
 *
 * This script is invoked from the build command with NODE_ENV forced to
 * 'development' (via cross-env) so that initializing Payload triggers the
 * schema push against the hosted database. It is idempotent and safe to run
 * on every deploy. For a hardened production setup, replace this with generated
 * migrations + `payload migrate`.
 */
import { getPayload } from 'payload'

const run = async () => {
  const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''

  if (!postgresUrl.startsWith('postgres')) {
    console.log('[initDb] No Postgres URL present at build time; skipping schema sync.')
    return
  }

  try {
    const u = new URL(postgresUrl)
    console.log(`[initDb] Connecting to Postgres host=${u.hostname} sslmode=${u.searchParams.get('sslmode') ?? '(default)'}`)
  } catch {
    console.log('[initDb] Connecting to Postgres (unparsable URL).')
  }

  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })
  payload.logger.info('[initDb] Postgres schema sync complete.')
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[initDb] Schema sync failed:', err)
    process.exit(1)
  })
