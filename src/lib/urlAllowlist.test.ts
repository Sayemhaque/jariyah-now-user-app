import { describe, it, expect, afterEach, vi } from 'vitest'
import { isAllowedAudioUrl } from './urlAllowlist'

// Mock env so tests don't need DATABASE_URL set, and so process.env
// overrides take effect for each test.
vi.mock('./env', () => ({
  env: new Proxy({} as Record<string, unknown>, {
    get(_target, prop: string) {
      if (prop === 'ALLOWED_AUDIO_HOSTS') {
        return process.env.ALLOWED_AUDIO_HOSTS || undefined
      }
      return undefined
    },
  }),
  resetEnv: vi.fn(),
  getEnv: vi.fn(),
  hasRedis: vi.fn(() => false),
}))

describe('isAllowedAudioUrl', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.ALLOWED_AUDIO_HOSTS
  })

  describe('accepts valid CDN URLs', () => {
    it('accepts a verses.quran.com HTTPS URL', () => {
      expect(
        isAllowedAudioUrl('https://verses.quran.com/Alafasy/mp3/001001.mp3'),
      ).toBe(true)
    })

    it('accepts a URL with a path and query string', () => {
      expect(
        isAllowedAudioUrl(
          'https://verses.quran.com/Alafasy/mp3/001001.mp3?cache=bust',
        ),
      ).toBe(true)
    })

    it('accepts a URL with a port (if the CDN ever uses one)', () => {
      // verses.quran.com:443 is the same as verses.quran.com
      expect(
        isAllowedAudioUrl('https://verses.quran.com:443/Alafasy/mp3/001001.mp3'),
      ).toBe(true)
    })

    it('is case-insensitive on the host', () => {
      expect(
        isAllowedAudioUrl('https://VERSES.QURAN.COM/Alafasy/mp3/001001.mp3'),
      ).toBe(true)
    })
  })

  describe('rejects SSRF vectors', () => {
    it('rejects http: URLs (must be https)', () => {
      expect(
        isAllowedAudioUrl('http://verses.quran.com/Alafasy/mp3/001001.mp3'),
      ).toBe(false)
    })

    it('rejects AWS metadata endpoint', () => {
      expect(
        isAllowedAudioUrl(
          'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
        ),
      ).toBe(false)
    })

    it('rejects localhost', () => {
      expect(
        isAllowedAudioUrl('http://localhost:3000/api/timings'),
      ).toBe(false)
      expect(
        isAllowedAudioUrl('https://localhost:3000/secret'),
      ).toBe(false)
    })

    it('rejects 127.0.0.1', () => {
      expect(isAllowedAudioUrl('http://127.0.0.1:8080/')).toBe(false)
      expect(isAllowedAudioUrl('https://127.0.0.1/')).toBe(false)
    })

    it('rejects private 10.x.x.x range', () => {
      expect(isAllowedAudioUrl('http://10.0.0.1/')).toBe(false)
      expect(isAllowedAudioUrl('https://10.0.0.1/')).toBe(false)
    })

    it('rejects private 192.168.x.x range', () => {
      expect(isAllowedAudioUrl('http://192.168.1.1/')).toBe(false)
    })

    it('rejects private 172.16-31.x.x range', () => {
      expect(isAllowedAudioUrl('http://172.16.0.1/')).toBe(false)
    })

    it('rejects a non-allowed external host', () => {
      expect(
        isAllowedAudioUrl('https://evil.example.com/Alafasy/mp3/001001.mp3'),
      ).toBe(false)
    })

    it('rejects URLs with embedded credentials', () => {
      expect(
        isAllowedAudioUrl(
          'https://user:pass@verses.quran.com/Alafasy/mp3/001001.mp3',
        ),
      ).toBe(false)
    })

    it('rejects file: URLs', () => {
      expect(isAllowedAudioUrl('file:///etc/passwd')).toBe(false)
    })

    it('rejects data: URLs', () => {
      expect(isAllowedAudioUrl('data:text/plain,hello')).toBe(false)
    })

    it('rejects a lookalike host (verses.quran.com.evil.com)', () => {
      expect(
        isAllowedAudioUrl(
          'https://verses.quran.com.evil.com/Alafasy/mp3/001001.mp3',
        ),
      ).toBe(false)
    })
  })

  describe('rejects malformed input', () => {
    it('rejects an empty string', () => {
      expect(isAllowedAudioUrl('')).toBe(false)
    })

    it('rejects a non-URL string', () => {
      expect(isAllowedAudioUrl('not a url')).toBe(false)
      expect(isAllowedAudioUrl('verses.quran.com')).toBe(false)
    })
  })

  describe('env override', () => {
    it('respects ALLOWED_AUDIO_HOSTS when set', () => {
      process.env.ALLOWED_AUDIO_HOSTS = 'cdn.example.com,verses.quran.com'
      expect(
        isAllowedAudioUrl('https://cdn.example.com/audio.mp3'),
      ).toBe(true)
      expect(
        isAllowedAudioUrl('https://verses.quran.com/audio.mp3'),
      ).toBe(true)
      // evil.example.com is not in the allowlist
      expect(
        isAllowedAudioUrl('https://evil.example.com/audio.mp3'),
      ).toBe(false)
    })
  })
})
