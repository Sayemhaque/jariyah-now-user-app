import { describe, it, expect } from 'vitest'
import {
  validateBackgroundImage,
  MAX_BACKGROUND_IMAGE_BYTES,
} from './uploadValidation'

describe('validateBackgroundImage', () => {
  describe('accepts valid images', () => {
    it('accepts a JPEG under the size limit', () => {
      expect(
        validateBackgroundImage({ type: 'image/jpeg', size: 1024 * 1024, name: 'photo.jpg' }).ok,
      ).toBe(true)
    })

    it('accepts a PNG under the size limit', () => {
      expect(
        validateBackgroundImage({ type: 'image/png', size: 500_000, name: 'bg.png' }).ok,
      ).toBe(true)
    })

    it('accepts a WebP', () => {
      expect(
        validateBackgroundImage({ type: 'image/webp', size: 1024, name: 'bg.webp' }).ok,
      ).toBe(true)
    })

    it('accepts a GIF', () => {
      expect(
        validateBackgroundImage({ type: 'image/gif', size: 1024, name: 'bg.gif' }).ok,
      ).toBe(true)
    })

    it('accepts an AVIF', () => {
      expect(
        validateBackgroundImage({ type: 'image/avif', size: 1024, name: 'bg.avif' }).ok,
      ).toBe(true)
    })

    it('accepts an image exactly at the size limit (boundary)', () => {
      expect(
        validateBackgroundImage({
          type: 'image/jpeg',
          size: MAX_BACKGROUND_IMAGE_BYTES,
          name: 'boundary.jpg',
        }).ok,
      ).toBe(true)
    })

    it('is case-insensitive on the MIME type', () => {
      expect(
        validateBackgroundImage({ type: 'IMAGE/JPEG', size: 1024, name: 'x.jpg' }).ok,
      ).toBe(true)
    })
  })

  describe('rejects SVG', () => {
    it('rejects image/svg+xml with a specific message', () => {
      const result = validateBackgroundImage({
        type: 'image/svg+xml',
        size: 1024,
        name: 'bg.svg',
      })
      expect(result.ok).toBe(false)
      expect(result.error).toMatch(/SVG/i)
      expect(result.error).toMatch(/script|break video export/i)
    })
  })

  describe('rejects other unsupported types', () => {
    it('rejects a plain text file', () => {
      const result = validateBackgroundImage({
        type: 'text/plain',
        size: 1024,
        name: 'notes.txt',
      })
      expect(result.ok).toBe(false)
      expect(result.error).toMatch(/unsupported image type/i)
    })

    it('rejects an empty MIME type', () => {
      const result = validateBackgroundImage({
        type: '',
        size: 1024,
        name: 'no-extension',
      })
      expect(result.ok).toBe(false)
      expect(result.error).toMatch(/unsupported image type/i)
    })

    it('rejects application/pdf', () => {
      const result = validateBackgroundImage({
        type: 'application/pdf',
        size: 1024,
        name: 'doc.pdf',
      })
      expect(result.ok).toBe(false)
    })

    it('rejects video/mp4', () => {
      const result = validateBackgroundImage({
        type: 'video/mp4',
        size: 1024,
        name: 'clip.mp4',
      })
      expect(result.ok).toBe(false)
    })
  })

  describe('rejects oversized files', () => {
    it('rejects a file 1 byte over the limit', () => {
      const result = validateBackgroundImage({
        type: 'image/jpeg',
        size: MAX_BACKGROUND_IMAGE_BYTES + 1,
        name: 'huge.jpg',
      })
      expect(result.ok).toBe(false)
      expect(result.error).toMatch(/MB/i)
      expect(result.error).toMatch(/maximum/i)
    })

    it('rejects a 500MB file', () => {
      const result = validateBackgroundImage({
        type: 'image/png',
        size: 500 * 1024 * 1024,
        name: 'giant.png',
      })
      expect(result.ok).toBe(false)
      expect(result.error).toMatch(/500\.0 MB/)
    })

    it('includes the actual file size in the error message', () => {
      const result = validateBackgroundImage({
        type: 'image/png',
        size: 10 * 1024 * 1024,
        name: 'big.png',
      })
      expect(result.ok).toBe(false)
      expect(result.error).toContain('10.0 MB')
    })
  })

  describe('MAX_BACKGROUND_IMAGE_BYTES', () => {
    it('is 5 MB', () => {
      expect(MAX_BACKGROUND_IMAGE_BYTES).toBe(5 * 1024 * 1024)
    })
  })
})
