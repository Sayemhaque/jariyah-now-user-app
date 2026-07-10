import { z } from 'zod'

/**
 * Environment variable schema. Validated once at boot — if a required var is
 * missing or malformed, the app fails fast instead of breaking silently at
 * request time in production.
 *
 * Add new vars here as the app grows. Anything client-visible must be prefixed
 * with NEXT_PUBLIC_ and also listed in the client-safe subset below.
 */
const envSchema = z.object({
  // --- External API base URLs (overrideable for testing) ---
  // UmmahAPI is the primary upstream — surah list, ayat text, translations,
  // reciter audio URLs. The X-API-Key for UmmahAPI is exposed to the client
  // via NEXT_PUBLIC_UMMAHAPI_KEY (see .env) so the browser can call the
  // API directly without proxying through our server.
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

  // --- SSRF allowlist ---
  // Comma-separated list of hosts the server is allowed to HEAD-fetch as
  // reciter audio (see lib/urlAllowlist.ts). Defaults to everyayah.com +
  // verses.quran.com (the UmmahAPI-backed MP3 CDN + the legacy per-word
  // fallback). Override if you host your own audio mirror.
  ALLOWED_AUDIO_HOSTS: z.string().optional(),

  // --- ffmpeg binary path (overrideable for containerized deploys) ---
  FFMPEG_BIN: z.string().default('ffmpeg'),

  // --- Rate limiting ---
  // Max renders per IP per window. Defaults to 3/hour per the spec.
  RENDER_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(6),
  RENDER_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(3_600_000),
  TIMINGS_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  TIMINGS_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),

  // --- External fetch timeout (ms) ---
  // Applied to every call to UmmahAPI / quran.com / the audio CDN so a slow
  // upstream never blocks a request indefinitely.
  EXTERNAL_FETCH_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),

  // --- Upstash Redis (optional — used for distributed rate limiting in prod) ---
  // When both are set, the rate limiter uses Redis so limits are shared across
  // serverless instances. Otherwise it falls back to an in-memory Map.
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // --- Sentry (optional — error tracking in production) ---
  // When set, the app forwards uncaught errors to Sentry. Leave unset in dev.
  SENTRY_DSN: z.string().url().optional(),

  // --- Object storage for rendered videos (optional in dev) ---
  // In production, rendered MP4s go to S3/R2 — never local disk, since
  // serverless filesystems are ephemeral.
  RENDER_STORAGE_BUCKET: z.string().optional(),
  RENDER_STORAGE_REGION: z.string().optional(),

  // --- Public app URL (used for signed download URLs) ---
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default('http://localhost:3000'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Parsed + validated environment.
 *
 * Server-side: validates `process.env` against the schema. Throws at module
 * load time if a required var is missing, so misconfiguration surfaces
 * during `next dev` / `next start` rather than at the first request.
 *
 * Client-side: returns the schema defaults + any `NEXT_PUBLIC_*` vars.
 */
function loadEnv(): Env {
  // On the client, process.env is either undefined or a sparse object
  // containing only NEXT_PUBLIC_* vars (the bundler inlines them). Either
  // way, skip strict validation — provide defaults so the schema passes and
  // the client gets the values it actually needs.
  if (typeof window !== 'undefined') {
    return envSchema.parse({
      // NEXT_PUBLIC_* vars are inlined by the bundler into process.env on
      // the client, so spread whatever is there.
      ...(typeof process !== 'undefined' ? process.env : {}),
    })
  }

  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    // In test mode, provide defaults so tests don't need a full .env.
    if (process.env.VITEST || process.env.NODE_ENV === 'test') {
      return envSchema.parse({})
    }
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n')
    console.error(
      `[env] Invalid environment variables:\n${issues}\n\n` +
        'Check your .env file against .env.example.',
    )
    throw new Error('Invalid environment configuration — see logs above.')
  }
  return parsed.data
}

// Lazy init: only validate on first access. This avoids running the schema
// during module-graph evaluation (which can happen on both server and
// client during build) and defers it to the first actual read.
let _env: Env | null = null
export function getEnv(): Env {
  if (!_env) _env = loadEnv()
  return _env
}

/** Reset the cached env (for testing). */
export function resetEnv(): void {
  _env = null
}

/** Backwards-compatible eager export. Resolves on first import. */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return (getEnv() as Record<string, unknown>)[prop]
  },
})

/**
 * True when Upstash Redis credentials are configured. Use this to decide
 * whether the rate limiter can run in distributed mode. Evaluated lazily
 * on first call so the env schema doesn't run at import time.
 */
export function hasRedis(): boolean {
  const e = getEnv()
  return Boolean(e.UPSTASH_REDIS_REST_URL && e.UPSTASH_REDIS_REST_TOKEN)
}
