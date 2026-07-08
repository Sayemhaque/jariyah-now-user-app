/**
 * fetch with an abort timeout. Every external call (UmmahAPI, quran.com,
 * the audio CDN) goes through this so a slow upstream never blocks a request
 * indefinitely. The timeout default comes from env.EXTERNAL_FETCH_TIMEOUT_MS
 * on the server, and falls back to 5s on the client (where env isn't read).
 */

// 5s default — matches the server-side env default. Reading env directly
// here would pull the env validator into client bundles, so we hardcode the
// fallback and only override on the server.
const DEFAULT_TIMEOUT_MS = 5000

export interface FetchWithOptions extends RequestInit {
  /** Per-call timeout override in ms. Defaults to 5s. */
  timeoutMs?: number
}

export async function fetchWithTimeout(
  url: string | URL,
  options: FetchWithOptions = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...init } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Type guard for fetch errors. Use this to distinguish a network/timeout
 * failure (which we degrade gracefully) from a successful HTTP response
 * with an error status code (which we surface to the user).
 */
export function isFetchAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}
