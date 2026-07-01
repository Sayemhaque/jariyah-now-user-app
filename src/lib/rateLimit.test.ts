import { describe, it, expect, beforeEach } from 'vitest'
// Import the in-memory consume function directly via the public API. We
// can't isolate it without refactoring, so we test through consumeRateLimit
// with a tight limit and verify the sliding-window behavior.
import { consumeRateLimit, getClientIp } from './rateLimit'

describe('consumeRateLimit (in-memory)', () => {
  // Use a unique key per test so they don't interfere with each other.
  let keyCounter = 0
  function uniqueKey(): string {
    keyCounter += 1
    return `test-key-${keyCounter}`
  }

  it('allows up to the limit, then blocks', async () => {
    const key = uniqueKey()
    const limit = 3
    const windowMs = 60_000

    const r1 = await consumeRateLimit(key, limit, windowMs)
    const r2 = await consumeRateLimit(key, limit, windowMs)
    const r3 = await consumeRateLimit(key, limit, windowMs)
    const r4 = await consumeRateLimit(key, limit, windowMs)

    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(true)
    expect(r3.ok).toBe(true)
    expect(r4.ok).toBe(false) // 4th request blocked
    expect(r4.remaining).toBe(0)
  })

  it('reports remaining count correctly', async () => {
    const key = uniqueKey()
    const limit = 5

    const r1 = await consumeRateLimit(key, limit, 60_000)
    expect(r1.remaining).toBe(4) // 5 - 1

    const r2 = await consumeRateLimit(key, limit, 60_000)
    expect(r2.remaining).toBe(3)
  })

  it('isolates keys — different IPs get separate buckets', async () => {
    const keyA = uniqueKey()
    const keyB = uniqueKey()
    const limit = 2

    await consumeRateLimit(keyA, limit, 60_000)
    await consumeRateLimit(keyA, limit, 60_000)
    // keyA is now exhausted
    expect((await consumeRateLimit(keyA, limit, 60_000)).ok).toBe(false)

    // keyB should still be allowed
    expect((await consumeRateLimit(keyB, limit, 60_000)).ok).toBe(true)
  })

  it('returns a resetMs in the future when blocked', async () => {
    const key = uniqueKey()
    const windowMs = 60_000
    await consumeRateLimit(key, 1, windowMs)
    const blocked = await consumeRateLimit(key, 1, windowMs)

    expect(blocked.ok).toBe(false)
    expect(blocked.resetMs).toBeGreaterThan(Date.now())
  })
})

describe('getClientIp', () => {
  it('extracts the first IP from X-Forwarded-For', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('falls back to X-Real-IP when X-Forwarded-For is absent', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-real-ip': '9.9.9.9' },
    })
    expect(getClientIp(req)).toBe('9.9.9.9')
  })

  it('returns "unknown" when no IP header is present', () => {
    const req = new Request('https://example.com')
    expect(getClientIp(req)).toBe('unknown')
  })

  it('trims whitespace around the IP', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '  1.2.3.4  , 5.6.7.8' },
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })
})
