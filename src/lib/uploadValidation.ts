export const maxBackgroundImageBytes = 5 * 1024 * 1024

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

export interface UploadValidationResult {
  ok: boolean
  error?: string
}

export function validateBackgroundImage(file: {
  type: string
  size: number
  name: string
}): UploadValidationResult {
  const mime = file.type.toLowerCase()
  if (!allowedMimeTypes.has(mime)) {
    if (mime === 'image/svg+xml') {
      return {
        ok: false,
        error:
          'SVG images are not supported (they can contain scripts and break video export). Please upload a JPG, PNG, WebP, or GIF.',
      }
    }
    return {
      ok: false,
      error: `Unsupported image type "${mime || 'unknown'}". Please upload a JPG, PNG, WebP, or GIF.`,
    }
  }

  if (file.size > maxBackgroundImageBytes) {
    const mb = (file.size / (1024 * 1024)).toFixed(1)
    const maxMb = (maxBackgroundImageBytes / (1024 * 1024)).toFixed(0)
    return {
      ok: false,
      error: `Image is ${mb} MB — the maximum is ${maxMb} MB. Please choose a smaller image.`,
    }
  }

  return { ok: true }
}
