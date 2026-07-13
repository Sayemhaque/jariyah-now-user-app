import { NextRequest, NextResponse } from 'next/server'

function isSameOriginWrite(opts: {
  method: string
  host: string | null
  origin: string | null
  secFetchSite: string | null
}): { ok: boolean } {
  // GET/HEAD are idempotent — no CSRF risk
  if (opts.method === 'GET' || opts.method === 'HEAD') return { ok: true }
  // If the browser sent Sec-Fetch-Site, trust it
  if (opts.secFetchSite === 'same-origin') return { ok: true }
  if (opts.secFetchSite === 'none') return { ok: true }
  // Fallback: compare Origin vs Host
  if (opts.origin && opts.host) {
    try {
      const originHost = new URL(opts.origin).host
      if (originHost === opts.host) return { ok: true }
    } catch {
      // invalid origin — reject
    }
  }
  return { ok: false }
}

/**
 * Next.js 16 proxy. Runs on matched requests before the route handler.
 *
 * Responsibilities:
 *   1. Attach a request ID header for log correlation.
 *   2. CSRF protection on state-changing API requests (POST/PUT/PATCH/DELETE).
 *   3. Basic bot filter on /api/render POST (the rate limiter in the route
 *      handles the per-IP quota; this is a first line against UA-less scrapers).
 *
 * Rate limiting lives in the route handler, not here — the proxy runs on the
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

export function proxy(req: NextRequest) {
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
  matcher: ['/api/:path*'],
}
