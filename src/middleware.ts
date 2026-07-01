import { NextRequest, NextResponse } from 'next/server'
import { isSameOriginWrite } from '@/lib/csrf'

/**
 * Edge middleware. Runs on every request before the route handler.
 *
 * Responsibilities:
 *   1. Attach a request ID header for log correlation.
 *   2. CSRF protection on state-changing API requests (POST/PUT/PATCH/DELETE).
 *   3. Basic bot filter on /api/render POST (the rate limiter in the route
 *      handles the per-IP quota; this is a first line against UA-less scrapers).
 *
 * Rate limiting lives in the route handler, not here — middleware runs on the
 * Edge runtime, which can't share in-memory state across invocations.
 */

const SUSPICIOUS_UA_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /httpclient/i,
]

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export function middleware(req: NextRequest) {
  const requestId =
    req.headers.get('x-request-id') ??
    `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-request-id', requestId)
  const res = NextResponse.next({ request: { headers: requestHeaders } })
  res.headers.set('x-request-id', requestId)

  const pathname = req.nextUrl.pathname

  // --- CSRF check on state-changing API requests ----------------------
  if (pathname.startsWith('/api/')) {
    const csrf = isSameOriginWrite({
      method: req.method,
      host: req.headers.get('host'),
      origin: req.headers.get('origin'),
      secFetchSite: req.headers.get('sec-fetch-site'),
    })
    if (!csrf.ok) {
      // Don't leak the requester's IP back to them — just log it server-side
      // and return a generic 403. The IP is included in the log context only.
      console.warn(
        JSON.stringify({
          t: new Date().toISOString(),
          level: 'warn',
          message: 'CSRF check failed',
          requestId,
          ip: getClientIp(req),
          method: req.method,
          pathname,
          reason: csrf.reason,
        }),
      )
      return NextResponse.json(
        { error: 'Forbidden — same-origin check failed', requestId },
        { status: 403 },
      )
    }
  }

  // --- Basic bot filter on /api/render POST ----------------------------
  if (pathname === '/api/render' && req.method === 'POST') {
    const ua = req.headers.get('user-agent') ?? ''
    if (!ua || SUSPICIOUS_UA_PATTERNS.some((re) => re.test(ua))) {
      return NextResponse.json(
        { error: 'Blocked', requestId },
        { status: 403 },
      )
    }
  }

  return res
}

export const config = {
  // Run on API routes only — the page itself doesn't need middleware.
  matcher: ['/api/:path*'],
}
