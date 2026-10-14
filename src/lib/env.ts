import { z } from 'zod'

const envSchema = z.object({
  UMMAHAPI_BASE_URL: z
    .string()
    .url()
    .default('https://ummahapi.com/api'),
  NEXT_PUBLIC_UMMAHAPI_KEY: z.string().default(''),
  QURAN_COM_API_BASE_URL: z
    .string()
    .url()
    .default('https://api.quran.com/api/v4'),
  QURAN_AUDIO_CDN_BASE_URL: z
    .string()
    .url()
    .default('https://everyayah.com'),

  ALLOWED_AUDIO_HOSTS: z.string().optional(),

  FFMPEG_BIN: z.string().default('ffmpeg'),

  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),

  RENDER_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(6),
  RENDER_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(3_600_000),
  TIMINGS_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  TIMINGS_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),

  EXTERNAL_FETCH_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  SENTRY_DSN: z.string().url().optional(),

  RENDER_STORAGE_BUCKET: z.string().optional(),
  RENDER_STORAGE_REGION: z.string().optional(),

  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default('http://localhost:3000'),

  TIKTOK_CLIENT_KEY: z.string().min(1).optional(),
  TIKTOK_CLIENT_SECRET: z.string().min(1).optional(),
  TIKTOK_REDIRECT_URI: z.string().url().optional(),
  TIKTOK_MEDIA_ORIGIN: z.string().url().optional(),

  GITHUB_TOKEN: z.string().min(1).optional(),
  GITHUB_OWNER: z.string().min(1).optional(),
  GITHUB_REPO: z.string().min(1).optional(),
})

export type Env = z.infer<typeof envSchema>

function withoutInvalidKeys(issues: { path: PropertyKey[] }[]): Record<string, string | undefined> {
  const invalid = new Set(issues.map((issue) => String(issue.path[0])))
  return Object.fromEntries(Object.entries(process.env).filter(([key]) => !invalid.has(key)))
}

function loadEnv(): Env {
  if (typeof window !== 'undefined') {
    return envSchema.parse({
      ...(typeof process !== 'undefined' ? process.env : {}),
    })
  }

  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    if (process.env.VITEST || process.env.NODE_ENV === 'test') {
      return envSchema.parse({})
    }
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n')
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(`[env] Ignoring invalid environment variables during build:\n${issues}`)
      return envSchema.parse(withoutInvalidKeys(parsed.error.issues))
    }
    console.error(
      `[env] Invalid environment variables:\n${issues}\n\n` +
        'Check your .env file against .env.example.',
    )
    throw new Error('Invalid environment configuration — see logs above.')
  }
  return parsed.data
}

let _env: Env | null = null
export function getEnv(): Env {
  if (!_env) _env = loadEnv()
  return _env
}

export function resetEnv(): void {
  _env = null
}

export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return (getEnv() as Record<string, unknown>)[prop]
  },
})

export function hasRedis(): boolean {
  const e = getEnv()
  return Boolean(e.UPSTASH_REDIS_REST_URL && e.UPSTASH_REDIS_REST_TOKEN)
}
