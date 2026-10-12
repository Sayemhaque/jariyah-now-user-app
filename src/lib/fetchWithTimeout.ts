const defaultTimeoutMs = 30000

export interface FetchWithOptions extends RequestInit {
  timeoutMs?: number
}

export async function fetchWithTimeout(
  url: string | URL,
  options: FetchWithOptions = {},
): Promise<Response> {
  const { timeoutMs = defaultTimeoutMs, ...init } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export function isFetchAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}
