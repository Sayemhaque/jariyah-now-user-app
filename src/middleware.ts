import { NextRequest, NextResponse } from 'next/server'

/**
 * Edge middleware. Runs on every request before the route handler.
 *
 * Responsibilities:
 *   1. Attach a request ID header so logs across a single request can be
 *      correlated downstream.
 *   2. Block obvious bots from hammering /api/render (the rate limiter in
 *      the route itself handles the per-IP quota; this is just a first line
 *      of defense against User-Agent-less scrapers).
 *
 * Note: the actual per-IP rate limiting lives in the route handler, not here.
 * Middleware runs on the Edge runtime, which can't share in-memory state
 * across invocations and can't dynamically import optional dependencies
 * like @upstash/redis. When we move fully to Upstash, the limiter can move
 * here too (the Redis client is Edge-compatible).
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
  // --- Request ID -----------------------------------------------------
  const requestId =
    req.headers.get('x-request-id') ??
    `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  const res = NextResponse.next({
    request: { headers: new Headers(req.headers) },
  })
  res.headers.set('x-request-id', requestId)

  // --- Basic bot filter on /api/render --------------------------------
  if (req.nextUrl.pathname === '/api/render' && req.method === 'POST') {
    const ua = req.headers.get('user-agent') ?? ''
    if (!ua || SUSPICIOUS_UA_PATTERNS.some((re) => re.test(ua))) {
      return NextResponse.json(
        {
          error: 'Blocked',
          requestId,
          ip: getClientIp(req),
        },
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
