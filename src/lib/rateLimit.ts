import { env, hasRedis } from './env'
import { logger } from './logger'

/**
 * Sliding-window rate limiter.
 *
 * - When Upstash Redis is configured (UPSTASH_REDIS_REST_URL +
 *   UPSTASH_REDIS_REST_TOKEN), uses @upstash/ratelimit so limits are shared
 *   across serverless instances. This is the production path.
 * - Otherwise, falls back to an in-memory Map. Correct for a single process
 *   (dev, single-instance prod) but under-counts in multi-instance deployments
 *   because each instance has its own Map.
 *
 * The public API (`consumeRateLimit`) is the same either way, so call sites
 * don't change when you flip from memory to Redis.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

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

// --- Redis implementation (lazy-initialized) --------------------------

let redisLimiter: Ratelimit | null = null

function getRedisLimiter(): Ratelimit | null {
  if (redisLimiter) return redisLimiter
  if (!hasRedis()) return null

  try {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
    // Sliding-window algorithm — accurate, slightly more expensive than
    // fixed-window but worth it for a low-traffic API.
    redisLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        env.RENDER_RATE_LIMIT_MAX,
        `${env.RENDER_RATE_LIMIT_WINDOW_MS} ms`,
      ),
      // Prefix keys so we don't collide with other uses of the same Redis.
      prefix: 'jariyahnow:rl',
      analytics: false,
    })
    logger.info('rate limiter initialized with Upstash Redis')
    return redisLimiter
  } catch (err) {
    logger.warn('Upstash Redis init failed — falling back to in-memory', {
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }
}

/**
 * Consume one unit from the rate-limit bucket identified by `key`. Returns
 * whether the request is allowed plus the remaining quota.
 *
 * Uses Redis when configured, in-memory otherwise.
 */
export async function consumeRateLimit(
  key: string,
  limit: number = env.RENDER_RATE_LIMIT_MAX,
  windowMs: number = env.RENDER_RATE_LIMIT_WINDOW_MS,
): Promise<RateLimitResult> {
  const limiter = getRedisLimiter()
  if (limiter) {
    try {
      const result = await limiter.limit(key)
      return {
        ok: result.success,
        remaining: result.remaining,
        // @upstash/ratelimit returns reset as a Unix timestamp in seconds.
        resetMs: result.reset * 1000,
      }
    } catch (err) {
      // If Redis is unreachable mid-request, degrade to in-memory rather
      // than failing the request outright. This is the safer default —
      // a Redis outage shouldn't block legitimate users entirely, and the
      // in-memory limiter still caps per-instance abuse.
      logger.warn('Redis rate limit failed — degrading to in-memory', {
        key,
        error: err instanceof Error ? err.message : String(err),
      })
    }
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
