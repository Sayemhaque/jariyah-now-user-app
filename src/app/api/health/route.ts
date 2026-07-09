import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'
import { ummahHeaders } from '@/lib/quranApi'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * GET /api/health
 *
 * Real health check — pings the database and both upstream Quran APIs
 * (UmmahAPI, quran.com) with a short timeout. Returns 200 when everything
 * is reachable, 503 when any dependency is down.
 *
 * Used by:
 *   - Uptime monitors (UptimeRobot, BetterUptime, etc.)
 *   - Load balancers / container orchestrators to decide whether to route
 *     traffic to this instance
 *   - The /about page (optionally) to show a live status indicator
 *
 * Response shape:
 *   { status: 'ok' | 'degraded' | 'down', checks: { db, ummahapi, qurancom }, ts }
 *
 * `no-store` so the result is always fresh.
 */

interface CheckResult {
  ok: boolean
  latencyMs?: number
  error?: string
}

async function checkDb(): Promise<CheckResult> {
  // The DB connection is lazy — Prisma connects on first query. We do a
  // trivial query here to force a connection attempt. If DATABASE_URL is
  // misconfigured, this surfaces it.
  try {
    // Dynamic import so the route doesn't fail to build if Prisma isn't
    // set up in a particular environment (e.g. CI without a DB).
    const { db } = await import('@/lib/db')
    // `$queryRaw` is the cheapest possible "is the DB up?" probe.
    await db.$queryRaw`SELECT 1`
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'DB connection failed',
    }
  }
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
      // Health checks should be fast — 3s cap so a slow upstream doesn't
      // make our health check itself slow.
      timeoutMs: 3_000,
      // Don't let Next.js cache the health-check response.
      cache: 'no-store',
    })
    const latencyMs = Date.now() - start
    if (!res.ok) {
      return { ok: false, latencyMs, error: `HTTP ${res.status}` }
    }
    // Optional substring check — confirms the response is actually from
    // the expected service, not a captive portal / error page.
    if (expectedSubstring) {
      const text = await res.text()
      if (!text.includes(expectedSubstring)) {
        return {
          ok: false,
          latencyMs,
          error: 'Unexpected response body',
        }
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
  const [db, ummahapi, qurancom] = await Promise.all([
    checkDb(),
    // UmmahAPI /quran/surahs returns a JSON list of 114 surahs — our
    // primary upstream. Requires the X-API-Key header for auth.
    checkUpstream(
      'ummahapi',
      `${env.UMMAHAPI_BASE_URL}/quran/surahs`,
      undefined,
      ummahHeaders(),
    ),
    // quran.com /chapters returns a JSON list of surahs — a reliable 200.
    checkUpstream('quran.com', `${env.QURAN_COM_API_BASE_URL}/chapters`, 'chapters'),
  ])

  const checks = { db, ummahapi, qurancom }
  const allOk = db.ok && ummahapi.ok && qurancom.ok
  const anyOk = db.ok || ummahapi.ok || qurancom.ok

  const status: 'ok' | 'degraded' | 'down' = allOk
    ? 'ok'
    : anyOk
      ? 'degraded'
      : 'down'

  if (!allOk) {
    logger.warn('health check degraded', { status, checks })
  }

  return NextResponse.json(
    {
      status,
      checks,
      ts: new Date().toISOString(),
    },
    {
      status: status === 'down' ? 503 : 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}
