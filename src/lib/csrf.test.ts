import { describe, it, expect } from 'vitest'
import { isSameOriginWrite } from './csrf'

describe('isSameOriginWrite', () => {
  describe('exempts safe methods', () => {
    it('allows GET without any origin headers', () => {
      expect(
        isSameOriginWrite({
          method: 'GET',
          host: 'example.com',
          origin: null,
          secFetchSite: null,
        }).ok,
      ).toBe(true)
    })

    it('allows HEAD', () => {
      expect(
        isSameOriginWrite({
          method: 'HEAD',
          host: 'example.com',
          origin: null,
          secFetchSite: null,
        }).ok,
      ).toBe(true)
    })

    it('allows OPTIONS', () => {
      expect(
        isSameOriginWrite({
          method: 'OPTIONS',
          host: 'example.com',
          origin: null,
          secFetchSite: null,
        }).ok,
      ).toBe(true)
    })

    it('is case-insensitive on the method', () => {
      expect(
        isSameOriginWrite({
          method: 'get',
          host: 'example.com',
          origin: null,
          secFetchSite: null,
        }).ok,
      ).toBe(true)
    })
  })

  describe('Sec-Fetch-Site signal', () => {
    it('allows POST with Sec-Fetch-Site: same-origin', () => {
      expect(
        isSameOriginWrite({
          method: 'POST',
          host: 'example.com',
          origin: null,
          secFetchSite: 'same-origin',
        }).ok,
      ).toBe(true)
    })

    it('allows PUT with Sec-Fetch-Site: same-origin', () => {
      expect(
        isSameOriginWrite({
          method: 'PUT',
          host: 'example.com',
          origin: null,
          secFetchSite: 'same-origin',
        }).ok,
      ).toBe(true)
    })

    it('rejects POST with Sec-Fetch-Site: cross-site', () => {
      const result = isSameOriginWrite({
        method: 'POST',
        host: 'example.com',
        origin: null,
        secFetchSite: 'cross-site',
      })
      expect(result.ok).toBe(false)
    })

    it('rejects POST with Sec-Fetch-Site: same-site (subdomain)', () => {
      // same-site means same registrable domain but different origin
      // (e.g. sub.example.com → example.com). For writes, we require same-origin.
      const result = isSameOriginWrite({
        method: 'POST',
        host: 'example.com',
        origin: null,
        secFetchSite: 'same-site',
      })
      expect(result.ok).toBe(false)
    })

    it('rejects POST with Sec-Fetch-Site: none (direct navigation)', () => {
      const result = isSameOriginWrite({
        method: 'POST',
        host: 'example.com',
        origin: null,
        secFetchSite: 'none',
      })
      expect(result.ok).toBe(false)
    })
  })

  describe('Origin header fallback', () => {
    it('allows POST when Origin matches Host (same host, same port)', () => {
      expect(
        isSameOriginWrite({
          method: 'POST',
          host: 'example.com',
          origin: 'https://example.com',
          secFetchSite: null,
        }).ok,
      ).toBe(true)
    })

    it('allows POST with matching host + port', () => {
      expect(
        isSameOriginWrite({
          method: 'POST',
          host: 'localhost:3000',
          origin: 'http://localhost:3000',
          secFetchSite: null,
        }).ok,
      ).toBe(true)
    })

    it('rejects POST when Origin host differs from Host', () => {
      const result = isSameOriginWrite({
        method: 'POST',
        host: 'example.com',
        origin: 'https://evil.com',
        secFetchSite: null,
      })
      expect(result.ok).toBe(false)
    })

    it('rejects POST when Origin port differs from Host', () => {
      const result = isSameOriginWrite({
        method: 'POST',
        host: 'localhost:3000',
        origin: 'http://localhost:3001',
        secFetchSite: null,
      })
      expect(result.ok).toBe(false)
    })

    it('rejects POST with a malformed Origin', () => {
      const result = isSameOriginWrite({
        method: 'POST',
        host: 'example.com',
        origin: 'not-a-url',
        secFetchSite: null,
      })
      expect(result.ok).toBe(false)
    })
  })

  describe('missing signals', () => {
    it('rejects POST with no Origin and no Sec-Fetch-Site', () => {
      const result = isSameOriginWrite({
        method: 'POST',
        host: 'example.com',
        origin: null,
        secFetchSite: null,
      })
      expect(result.ok).toBe(false)
      expect(result.reason).toMatch(/missing/i)
    })

    it('rejects POST with no Host header', () => {
      const result = isSameOriginWrite({
        method: 'POST',
        host: null,
        origin: 'https://example.com',
        secFetchSite: null,
      })
      expect(result.ok).toBe(false)
    })
  })

  describe('all write methods covered', () => {
    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
    for (const method of writeMethods) {
      it(`enforces the check on ${method}`, () => {
        // Without any same-origin signal, every write method is rejected.
        const result = isSameOriginWrite({
          method,
          host: 'example.com',
          origin: null,
          secFetchSite: null,
        })
        expect(result.ok).toBe(false)
      })
    }
  })
})
