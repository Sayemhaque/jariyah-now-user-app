import { describe, it, expect, vi, beforeEach } from 'vitest'
import { consumeRateLimit, getClientIp } from './rateLimit'

// Hoisted mock factories so we can change behavior per test
const { mockHasRedis, mockRedis, mockLimit, mockRatelimit } = vi.hoisted(() => {
  const mockLimit = vi.fn()
  const mockRatelimit = Object.assign(
    vi.fn(function () { return { limit: mockLimit } }),
    { slidingWindow: vi.fn() },
  )
  return {
    mockHasRedis: vi.fn().mockReturnValue(false),
    mockRedis: vi.fn(),
    mockLimit,
    mockRatelimit,
  }
})

vi.mock('@upstash/redis', () => ({ Redis: mockRedis }))
vi.mock('@upstash/ratelimit', () => ({ Ratelimit: mockRatelimit }))
vi.mock('./env', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return { ...actual, hasRedis: mockHasRedis }
})

beforeEach(() => {
  mockHasRedis.mockReturnValue(false)
})

describe('consumeRateLimit (in-memory)', () => {
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
    expect(r4.ok).toBe(false)
    expect(r4.remaining).toBe(0)
  })

  it('reports remaining count correctly', async () => {
    const key = uniqueKey()
    const limit = 5

    const r1 = await consumeRateLimit(key, limit, 60_000)
    expect(r1.remaining).toBe(4)

    const r2 = await consumeRateLimit(key, limit, 60_000)
    expect(r2.remaining).toBe(3)
  })

  it('isolates keys — different IPs get separate buckets', async () => {
    const keyA = uniqueKey()
    const keyB = uniqueKey()
    const limit = 2

    await consumeRateLimit(keyA, limit, 60_000)
    await consumeRateLimit(keyA, limit, 60_000)
    expect((await consumeRateLimit(keyA, limit, 60_000)).ok).toBe(false)

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

describe('consumeRateLimit (Redis path)', () => {
  beforeEach(() => {
    vi.resetModules()
    mockHasRedis.mockReturnValue(true)
    mockRedis.mockImplementation(function () { return {} })
    mockLimit.mockReset()
  })

  it('uses Redis when configured and returns success', async () => {
    mockLimit.mockResolvedValue({
      success: true,
      remaining: 4,
      reset: Math.floor(Date.now() / 1000) + 60,
    })

    const { consumeRateLimit: redisConsume } = await import('./rateLimit')
    const result = await redisConsume('redis-ok', 5, 60000)

    expect(result.ok).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.resetMs).toBeGreaterThan(Date.now())
  })

  it('blocks when Redis rate limit is exceeded', async () => {
    mockLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + 60,
    })

    const { consumeRateLimit: redisConsume } = await import('./rateLimit')
    const result = await redisConsume('redis-blocked', 1, 60000)

    expect(result.ok).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.resetMs).toBeGreaterThan(Date.now())
  })

  it('falls back to in-memory when Redis init fails', async () => {
    mockRedis.mockImplementation(function () {
      throw new Error('connection refused')
    })

    const { consumeRateLimit: redisConsume } = await import('./rateLimit')
    const result = await redisConsume('redis-init-fail', 2, 60000)

    expect(result.ok).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('handles non-Error Redis init failure (String(err) branch)', async () => {
    mockRedis.mockImplementation(function () {
      throw 'connection string refused'
    })

    const { consumeRateLimit: redisConsume } = await import('./rateLimit')
    const result = await redisConsume('redis-non-error-init', 2, 60000)

    expect(result.ok).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('handles non-Error Redis limit call failure (String(err) branch)', async () => {
    mockLimit.mockResolvedValue({
      success: true,
      remaining: 4,
      reset: Math.floor(Date.now() / 1000) + 60,
    })

    const { consumeRateLimit: redisConsume } = await import('./rateLimit')
    await redisConsume('redis-seed-nonerror', 5, 60000)

    mockLimit.mockRejectedValue('raw string timeout')
    const result = await redisConsume('redis-non-error-call', 1, 60000)

    expect(result.ok).toBe(true)
    expect(result.remaining).toBe(0)
  })

  it('falls back to in-memory when Redis limit call fails mid-request', async () => {
    mockLimit.mockResolvedValue({
      success: true,
      remaining: 4,
      reset: Math.floor(Date.now() / 1000) + 60,
    })

    const { consumeRateLimit: redisConsume } = await import('./rateLimit')
    await redisConsume('redis-seed', 5, 60000)

    mockLimit.mockRejectedValue(new Error('Redis timeout'))
    const result = await redisConsume('redis-call-fail', 1, 60000)

    expect(result.ok).toBe(true)
    expect(result.remaining).toBe(0)
  })
})
