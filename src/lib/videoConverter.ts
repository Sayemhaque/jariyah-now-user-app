/**
 * Client-side WebM → MP4 converter.
 * Posts the WebM blob to /api/convert-mp4, which runs Python+ffmpeg
 * server-side and returns the MP4.
 */

export interface ConvertOptions {
  onProgress?: (ratio: number) => void
}

export function canConvertToMp4(): boolean {
  return true
}

export async function webmToMp4(
  webmBlob: Blob,
  options?: ConvertOptions,
): Promise<Blob> {
  const timeoutMs = 300_000
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('MP4 conversion timed out')), timeoutMs),
  )

  const convertPromise = (async () => {
    return new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/convert-mp4', true)
      xhr.responseType = 'blob'

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
              reject(new Error(json.error || json.detail || `HTTP ${xhr.status}`))
            } catch {
              reject(new Error(`HTTP ${xhr.status}`))
            }
          }
          reader.onerror = () => reject(new Error(`HTTP ${xhr.status}`))
          reader.readAsText(xhr.response as Blob)
        }
      }

      xhr.onerror = () => reject(new Error('Network error during MP4 conversion'))
      xhr.onabort = () => reject(new Error('MP4 conversion aborted'))

      xhr.setRequestHeader('Content-Type', 'application/octet-stream')
      xhr.send(webmBlob)
    })
  })()

  return Promise.race([convertPromise, timeoutPromise])
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
