/**
 * Browser-capability detection for the client-side video export pipeline.
 *
 * The export uses three Web APIs that aren't available in every browser:
 *   1. MediaRecorder — the core video recording API
 *   2. Canvas.captureStream() — turns a <canvas> into a MediaStream
 *   3. AudioContext (or webkitAudioContext) — mixes the reciter audio
 *
 * If any of these is missing, the export will throw a ReferenceError or
 * TypeError mid-render, which surfaces to the user as a generic "Render
 * failed" toast. This module lets us detect the gap up-front and show a
 * clear, actionable message instead.
 *
 * Extracted as a pure function so it can be unit-tested with a mocked
 * `globalThis` — the ExportModal just calls `checkExportCapabilities()`
 * on mount and renders the warning block if it returns a non-empty reason.
 */

export interface ExportCapabilityCheck {
  ok: boolean
  /** Human-readable explanation when ok is false. Empty when ok. */
  reason: string
  /** The MIME type the recorder will use, when ok. */
  mimeType: string
}

/**
 * Detect whether the current browser can run the client-side export.
 * Returns {ok: true, mimeType} when everything is available, or
 * {ok: false, reason} with a user-facing explanation when something is
 * missing.
 *
 * Safe to call server-side (during SSR) — it returns {ok: false} without
 * throwing, because `window` / `MediaRecorder` are undefined there.
 */
export function checkExportCapabilities(): ExportCapabilityCheck {
  // Guard for SSR — the export only runs client-side, but the modal
  // component is rendered (with open=false) during SSR.
  if (typeof window === 'undefined') {
    return {
      ok: false,
      reason: 'Export is only available in the browser.',
      mimeType: '',
    }
  }

  // 1. MediaRecorder
  if (typeof MediaRecorder === 'undefined') {
    return {
      ok: false,
      reason:
        "Your browser doesn't support in-browser video recording (MediaRecorder). Try Chrome, Edge, or Firefox on desktop — or Safari 14.1+.",
      mimeType: '',
    }
  }

  // 2. Canvas.captureStream
  const canvas = document.createElement('canvas')
  if (typeof canvas.captureStream !== 'function') {
    return {
      ok: false,
      reason:
        "Your browser doesn't support canvas video capture. Try Chrome, Edge, or Firefox on desktop.",
      mimeType: '',
    }
  }

  // 3. AudioContext (with Safari fallback)
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AudioCtx) {
    return {
      ok: false,
      reason:
        "Your browser doesn't support the Web Audio API. Try Chrome, Edge, or Firefox on desktop.",
      mimeType: '',
    }
  }

  // 4. Find a supported MIME type. If none of our candidates work, the
  //    recorder will still start (with the browser default) but the output
  //    may not play everywhere — warn the user.
  const mime = pickSupportedMimeType()
  if (!mime) {
    return {
      ok: false,
      reason:
        "Your browser can't produce a video in a supported format (WebM or MP4). Try Chrome, Edge, or Firefox on desktop.",
      mimeType: '',
    }
  }

  return { ok: true, reason: '', mimeType: mime }
}

/**
 * Pick the first supported MIME type from our candidate list. Returns ''
 * if none are supported. Exported so the render function can reuse the
 * same list without duplicating it.
 */
export function pickSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ]
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c
    } catch {
      // isTypeSupported can throw on some browsers for malformed strings
    }
  }
  return ''
}
