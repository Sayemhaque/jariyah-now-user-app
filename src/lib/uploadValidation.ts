/**
 * Validation for user-uploaded background images.
 *
 * The upload goes through `FileReader.readAsDataURL` → in-memory Zustand
 * store → eventually an `Image()` for canvas rendering. Without validation
 * a user could pick a 500MB file (memory bloat / browser crash) or an SVG
 * with embedded `<script>` (XSS surface when loaded as `<img src="data:image/svg+xml;...">`
 * or canvas-taint risk).
 *
 * This module exposes a pure `validateBackgroundImage(file)` function so the
 * UI can show a clear toast on rejection and the logic can be unit-tested
 * without a DOM.
 */

/** Max accepted file size: 5 MB. Large enough for a high-res photo, small enough to prevent memory abuse. */
export const MAX_BACKGROUND_IMAGE_BYTES = 5 * 1024 * 1024

/**
 * MIME types we accept for background images. SVG is intentionally excluded
 * because:
 *   1. SVG can contain `<script>` — a mild XSS surface when loaded as a data: URL.
 *   2. SVG loaded into a canvas taints it (cross-origin), which silently breaks
 *      `canvas.captureStream()` / `toDataURL()` in the export pipeline.
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

export interface UploadValidationResult {
  ok: boolean
  /** Human-readable error message when ok is false. Empty when ok. */
  error?: string
}

/**
 * Validate a user-selected background image file. Returns {ok: true} when
 * the file is an accepted image type under the size cap, or {ok: false, error}
 * with a user-facing message otherwise.
 *
 * Pure function — no DOM access. The caller passes the File object.
 */
export function validateBackgroundImage(file: {
  type: string
  size: number
  name: string
}): UploadValidationResult {
  // 1. MIME type check. `accept="image/*"` on the <input> is a browser hint
  //    only — users can bypass it via drag-drop or curl. We enforce here.
  const mime = file.type.toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(mime)) {
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

  // 2. Size check. A 500MB file would base64-encode into ~670MB in memory
  //    and likely crash the tab.
  if (file.size > MAX_BACKGROUND_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1)
    const maxMb = (MAX_BACKGROUND_IMAGE_BYTES / (1024 * 1024)).toFixed(0)
    return {
      ok: false,
      error: `Image is ${mb} MB — the maximum is ${maxMb} MB. Please choose a smaller image.`,
    }
  }

  return { ok: true }
}
