import { env, hasRedis } from './env'
import { logger } from './logger'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetMs: number
}

const buckets = new Map<string, number[]>()

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

let redisLimiter: Ratelimit | null = null

function getRedisLimiter(): Ratelimit | null {
  if (redisLimiter) return redisLimiter
  if (!hasRedis()) return null

  try {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
    redisLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        env.RENDER_RATE_LIMIT_MAX,
        `${env.RENDER_RATE_LIMIT_WINDOW_MS} ms`,
      ),
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
        resetMs: result.reset * 1000,
      }
    } catch (err) {
      logger.warn('Redis rate limit failed — degrading to in-memory', {
        key,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
  return inMemoryConsume(key, limit, windowMs)
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
