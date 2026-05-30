import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const redact = (s?: string | null) =>
  s ? s.replace(/postgres(ql)?:\/\/[^\s"']+/gi, 'postgres://REDACTED') : s

// Temporary diagnostic: surfaces the real Payload init error (otherwise hidden
// behind "There was an error initializing Payload"). Remove once the CMS works.
export async function GET() {
  try {
    await getPayload({ config })
    return Response.json({ ok: true, initialized: true })
  } catch (err) {
    const e = err as Error & { cause?: unknown }
    const cause = e?.cause as { message?: string; code?: string } | undefined
    return Response.json(
      {
        ok: false,
        name: e?.name ?? null,
        message: redact(e?.message) ?? null,
        causeMessage: redact(cause?.message) ?? null,
        causeCode: cause?.code ?? null,
        stack: redact(e?.stack)?.split('\n').slice(0, 14).join('\n') ?? null,
      },
      { status: 500 },
    )
  }
}
