import { env, hasRedis } from './env'
import { logger } from './logger'

/**
 * Sliding-window rate limiter.
 *
 * Current implementation: in-memory Map. Correct for a single process (dev,
 * single-instance prod). Under-counts in multi-instance deployments because
 * each instance has its own Map.
 *
 * Production upgrade path (no code changes at call sites):
 *   1. Install @upstash/redis: `bun add @upstash/redis`
 *   2. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *   3. Uncomment the Redis branch in `getRedisClient()` below.
 *
 * The public API (`consumeRateLimit`) stays the same either way.
 *
 * We intentionally DON'T dynamically import @upstash/redis here because the
 * bundler tries to resolve it at build time even inside a try/catch, which
 * breaks the build when the package isn't installed. Instead, document the
 * upgrade path and require an explicit install step.
 */

export interface RateLimitResult {
  ok: boolean
  remaining: number
  /** Epoch ms when the oldest request in the current window expires. */
  resetMs: number
}

// --- In-memory implementation -----------------------------------------

const buckets = new Map<string, number[]>() // ip -> array of request timestamps

function inMemoryConsume(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const cutoff = now - windowMs
  const arr = (buckets.get(key) ?? []).filter((t) => t > cutoff)

  if (arr.length >= limit) {
    const resetMs = arr[0]! + windowMs
    buckets.set(key, arr)
    return { ok: false, remaining: 0, resetMs }
  }

  arr.push(now)
  buckets.set(key, arr)
  return { ok: true, remaining: limit - arr.length, resetMs: now + windowMs }
}

/*
 * Redis implementation — uncomment after `bun add @upstash/redis`:
 *
 * import { Redis } from '@upstash/redis'
 *
 * let redis: Redis | null = null
 * function getRedis(): Redis | null {
 *   if (!hasRedis) return null
 *   if (!redis) redis = Redis.fromEnv()
 *   return redis
 * }
 *
 * async function redisConsume(key, limit, windowMs): Promise<RateLimitResult> {
 *   const r = getRedis()
 *   if (!r) return inMemoryConsume(key, limit, windowMs)
 *   const now = Date.now()
 *   const windowKey = `rl:${key}:${Math.floor(now / windowMs)}`
 *   const count = await r.incr(windowKey)
 *   if (count === 1) await r.expire(windowKey, Math.ceil(windowMs / 1000))
 *   return { ok: count <= limit, remaining: Math.max(0, limit - count), resetMs: now + windowMs }
 * }
 */

/**
 * Consume one unit from the rate-limit bucket identified by `key`. Returns
 * whether the request is allowed plus the remaining quota.
 */
export async function consumeRateLimit(
  key: string,
  limit: number = env.RENDER_RATE_LIMIT_MAX,
  windowMs: number = env.RENDER_RATE_LIMIT_WINDOW_MS,
): Promise<RateLimitResult> {
  // When Redis is configured, swap to the Redis implementation (see comment
  // block above). For now, always use in-memory.
  if (hasRedis()) {
    logger.debug('rate limit using in-memory (Redis branch not enabled)')
  }
  return inMemoryConsume(key, limit, windowMs)
}

/**
 * Extract a client IP from a Next.js request, respecting the X-Forwarded-For
 * chain. Falls back to a sentinel string when no IP can be determined.
 */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

