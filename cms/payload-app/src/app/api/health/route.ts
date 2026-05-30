export const dynamic = 'force-dynamic'

export function GET() {
  const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
  const usePostgres = postgresUrl.startsWith('postgres')

  // Booleans only — never leak secret values.
  return Response.json({
    ok: true,
    service: 'payload-cms',
    env: {
      hasPayloadSecret: Boolean(process.env.PAYLOAD_SECRET),
      hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      dbMode: usePostgres ? 'postgres' : 'sqlite',
      nodeEnv: process.env.NODE_ENV ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
    },
  })
}
