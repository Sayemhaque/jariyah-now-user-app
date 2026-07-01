/**
 * CSRF protection for same-origin write requests.
 *
 * Strategy: for any state-changing HTTP method (POST/PUT/DELETE/PATCH) to
 * `/api/*`, require evidence that the request originated from the same site.
 * We accept either:
 *   1. `Sec-Fetch-Site: same-origin` (the modern, reliable signal), or
 *   2. an `Origin` header whose host matches the request's `Host` header.
 *
 * If neither is present, we reject with 403. GET/HEAD/OPTIONS are exempt
 * (they should be side-effect-free, and the browser doesn't send Origin on
 * simple GETs).
 *
 * This blocks the classic CSRF attack where a malicious site submits a form
 * or fetch() to our API while the victim is logged in. Since we have no
 * auth, the main risk is drive-by abuse — but the same check covers both.
 */

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export interface CsrfCheckInput {
  method: string
  host: string | null
  origin: string | null
  secFetchSite: string | null
}

export interface CsrfCheckResult {
  ok: boolean
  reason?: string
}

/**
 * Pure function: decide whether a write request passes the CSRF check.
 * Extracted from the middleware so it can be unit-tested without spinning
 * up a Next.js server.
 */
export function isSameOriginWrite(input: CsrfCheckInput): CsrfCheckResult {
  const method = input.method.toUpperCase()

  // Only enforce on state-changing methods. GET/HEAD/OPTIONS are exempt.
  if (!WRITE_METHODS.has(method)) {
    return { ok: true }
  }

  // 1. Modern browsers send Sec-Fetch-Site. "same-origin" means the request
  //    came from the same origin as the target. "same-site" / "cross-site"
  //    / "none" should be rejected for writes.
  if (input.secFetchSite === 'same-origin') {
    return { ok: true }
  }

  // 2. Fallback: compare Origin header against Host. Both include the port
  //    when non-default, so we compare the host+port pair. Origin is sent
  //    by the browser on all cross-origin POSTs and same-origin POSTs/PUTs.
  if (input.origin && input.host) {
    try {
      const originUrl = new URL(input.origin)
      const originHost = originUrl.host // e.g. "localhost:3000" or "example.com"
      if (originHost === input.host) {
        return { ok: true }
      }
      return {
        ok: false,
        reason: `Origin ${originHost} does not match Host ${input.host}`,
      }
    } catch {
      return { ok: false, reason: 'Malformed Origin header' }
    }
  }

  // 3. No Origin and no Sec-Fetch-Site on a write — reject. This is the
  //    case for curl/raw HTTP clients. We could allow a CSRF token as an
  //    alternative, but the app has no accounts to issue tokens to.
  return {
    ok: false,
    reason: 'Missing same-origin signal (Origin or Sec-Fetch-Site: same-origin)',
  }
}
