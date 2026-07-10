/**
 * Client-side WebM → MP4 converter.
 * Posts the WebM blob to /api/convert-mp4, which runs Python+ffmpeg
 * server-side and returns the MP4.
 */

export interface ConvertOptions {
  onProgress?: (ratio: number) => void
}

let mp4Available: boolean | null = null
let mp4CheckPromise: Promise<boolean> | null = null

export async function canConvertToMp4(): Promise<boolean> {
  if (mp4Available !== null) return mp4Available
  if (mp4CheckPromise !== null) return mp4CheckPromise

  mp4CheckPromise = (async () => {
    try {
      const res = await fetch('/api/convert-mp4', { method: 'GET', signal: AbortSignal.timeout(5000) })
      if (!res.ok) return false
      const json = (await res.json()) as { ok?: boolean }
      mp4Available = Boolean(json.ok)
      return mp4Available
    } catch {
      mp4Available = false
      return false
    }
  })()

  return mp4CheckPromise
}

async function xhrUpload(
  webmBlob: Blob,
  options?: ConvertOptions,
  signal?: AbortSignal,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/convert-mp4', true)
    xhr.responseType = 'blob'

    if (signal) {
      signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }

    // Upload progress (0 → 0.5)
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !options?.onProgress) return
      options.onProgress((e.loaded / e.total) * 0.5)
    }

    // Download progress (0.5 → 1.0)
    xhr.onprogress = (e) => {
      if (!e.lengthComputable || !options?.onProgress) return
      options.onProgress(0.5 + (e.loaded / e.total) * 0.5)
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response as Blob
        if (!blob || blob.size === 0) {
          reject(new Error('Server returned empty MP4'))
          return
        }
        const mp4Blob = new Blob([blob], { type: 'video/mp4' })
        options?.onProgress?.(1)
        resolve(mp4Blob)
      } else {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const json = JSON.parse(reader.result as string)
            const msg = json.error || json.detail || `HTTP ${xhr.status}`
            const err = new Error(msg)
            ;(err as any).status = xhr.status
            reject(err)
          } catch {
            const err = new Error(`HTTP ${xhr.status}`)
            ;(err as any).status = xhr.status
            reject(err)
          }
        }
        reader.onerror = () => {
          const err = new Error(`HTTP ${xhr.status}`)
          ;(err as any).status = xhr.status
          reject(err)
        }
        reader.readAsText(xhr.response as Blob)
      }
    }

    xhr.onerror = () => reject(new Error('Network error during MP4 conversion'))
    xhr.onabort = () => reject(new Error('MP4 conversion aborted'))

    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.send(webmBlob)
  })
}

function isRetryable(err: Error): boolean {
  const msg = err.message
  if (msg === 'Network error during MP4 conversion') return true
  if (msg === 'MP4 conversion aborted') return false
  if (msg === 'Server returned empty MP4') return true
  if (msg.startsWith('HTTP 5')) return true // 5xx server errors
  if (msg.startsWith('HTTP 4')) return false // 4xx client errors
  return false
}

export async function webmToMp4(
  webmBlob: Blob,
  options?: ConvertOptions,
): Promise<Blob> {
  const MAX_RETRIES = 2
  const BASE_DELAY_MS = 2000
  const timeoutMs = 300_000
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1)
      await new Promise((r) => setTimeout(r, delay))
    }

    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), timeoutMs)

    try {
      const result = await xhrUpload(webmBlob, options, ac.signal)
      clearTimeout(timer)
      return result
    } catch (err) {
      clearTimeout(timer)
      const error = err instanceof Error ? err : new Error(String(err))
      // If aborted due to timeout
      if (ac.signal.aborted && error.message === 'MP4 conversion aborted') {
        lastError = new Error('MP4 conversion timed out')
      } else {
        lastError = error
      }
      // Don't retry non-retryable errors
      if (!isRetryable(lastError)) break
    }
  }

  throw lastError ?? new Error('MP4 conversion failed')
}

export async function isMp4ConversionAvailable(): Promise<boolean> {
  try {
    const res = await fetch('/api/convert-mp4', { method: 'GET' })
    if (!res.ok) return false
    const json = (await res.json()) as { ok?: boolean }
    return Boolean(json.ok)
  } catch {
    return false
  }
}
