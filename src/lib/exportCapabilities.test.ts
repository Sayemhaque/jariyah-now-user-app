import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkExportCapabilities, pickSupportedMimeType } from './exportCapabilities'

/**
 * Tests for the browser-capability pre-flight check.
 *
 * The check inspects `window`, `MediaRecorder`, `HTMLCanvasElement.prototype.captureStream`,
 * and `AudioContext`/`webkitAudioContext`. We mock each of these to simulate
 * supported vs unsupported browsers.
 */

describe('pickSupportedMimeType', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns empty string when MediaRecorder is undefined', () => {
    vi.stubGlobal('MediaRecorder', undefined)
    expect(pickSupportedMimeType()).toBe('')
  })

  it('returns the first supported candidate (VP9)', () => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: (c: string) => c === 'video/webm;codecs=vp9,opus',
    })
    expect(pickSupportedMimeType()).toBe('video/webm;codecs=vp9,opus')
  })

  it('falls back to VP8 when VP9 is unsupported', () => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: (c: string) => c === 'video/webm;codecs=vp8,opus',
    })
    expect(pickSupportedMimeType()).toBe('video/webm;codecs=vp8,opus')
  })

  it('falls back to plain webm', () => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: (c: string) => c === 'video/webm',
    })
    expect(pickSupportedMimeType()).toBe('video/webm')
  })

  it('falls back to mp4 when no webm is supported', () => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: (c: string) => c === 'video/mp4',
    })
    expect(pickSupportedMimeType()).toBe('video/mp4')
  })

  it('returns empty string when no candidate is supported', () => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: () => false,
    })
    expect(pickSupportedMimeType()).toBe('')
  })

  it('returns empty string when isTypeSupported throws', () => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: () => {
        throw new Error('not implemented')
      },
    })
    expect(pickSupportedMimeType()).toBe('')
  })
})

describe('checkExportCapabilities', () => {
  beforeEach(() => {
    // Default to a fully-capable browser. Individual tests override specific
    // globals to simulate missing capabilities.
    vi.stubGlobal('window', globalThis)
    vi.stubGlobal('MediaRecorder', class {
      static isTypeSupported() {
        return true
      }
    })
    // Stub captureStream on the canvas prototype.
    vi.stubGlobal('HTMLCanvasElement', class {
      captureStream() {
        return { getAudioTracks: () => [], getVideoTracks: () => [] }
      }
    })
    vi.stubGlobal('AudioContext', class {})
    vi.stubGlobal('document', {
      createElement: () => ({
        captureStream: () => ({ getAudioTracks: () => [], getVideoTracks: () => [] }),
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns ok when all capabilities are present', () => {
    const result = checkExportCapabilities()
    expect(result.ok).toBe(true)
    expect(result.reason).toBe('')
    expect(result.mimeType).toBeTruthy()
  })

  it('returns not-ok on the server (no window)', () => {
    vi.stubGlobal('window', undefined)
    const result = checkExportCapabilities()
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/only available in the browser/i)
  })

  it('returns not-ok when MediaRecorder is missing', () => {
    vi.stubGlobal('MediaRecorder', undefined)
    const result = checkExportCapabilities()
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/MediaRecorder/i)
  })

  it('returns not-ok when no MIME type is supported', () => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: () => false,
    })
    const result = checkExportCapabilities()
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/supported format/i)
  })
})
