import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'
import { ummahHeaders } from '@/lib/quranApi'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * GET /api/health
 *
 * Pings both upstream Quran APIs (UmmahAPI, quran.com) with a short
 * timeout. Returns 200 when everything is reachable, 503 when all
 * upstreams are down.
 *
 * Response shape:
 *   { status: 'ok' | 'degraded' | 'down', checks: { ummahapi, qurancom }, ts }
 */

interface CheckResult {
  ok: boolean
  latencyMs?: number
  error?: string
}

async function checkUpstream(
  name: string,
  url: string,
  expectedSubstring?: string,
  headers?: HeadersInit,
): Promise<CheckResult> {
  const start = Date.now()
  try {
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers,
      timeoutMs: 3_000,
      cache: 'no-store',
    })
    const latencyMs = Date.now() - start
    if (!res.ok) {
      return { ok: false, latencyMs, error: `HTTP ${res.status}` }
    }
    if (expectedSubstring) {
      const text = await res.text()
      if (!text.includes(expectedSubstring)) {
        return { ok: false, latencyMs, error: 'Unexpected response body' }
      }
    }
    return { ok: true, latencyMs }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : `${name} unreachable`,
    }
  }
}

export async function GET() {
  const [ummahapi, qurancom] = await Promise.all([
    checkUpstream(
      'ummahapi',
      `${env.UMMAHAPI_BASE_URL}/quran/surahs`,
      undefined,
      ummahHeaders(),
    ),
    checkUpstream('quran.com', `${env.QURAN_COM_API_BASE_URL}/chapters`, 'chapters'),
  ])

  const checks = { ummahapi, qurancom }
  const allOk = ummahapi.ok && qurancom.ok
  const anyOk = ummahapi.ok || qurancom.ok
  const status = allOk ? 'ok' : anyOk ? 'degraded' : 'down'

  if (!allOk) logger.warn('health check degraded', { status, checks })

  return NextResponse.json(
    { status, checks, ts: new Date().toISOString() },
    { status: status === 'down' ? 503 : 200, headers: { 'Cache-Control': 'no-store' } },
  )
}
