import { logger } from './logger'

/**
 * In-memory render job store. Suitable for a single-process dev server.
 *
 * Production upgrade path:
 *   - Move this to a database table (Prisma model `RenderJob`) or Redis hash.
 *   - The job record persists across serverless instance restarts, and
 *     multiple instances can read/update the same job.
 *   - The actual render work moves to a queue (Inngest / Trigger.dev / a
 *     worker process) so the HTTP request that creates the job returns 202
 *     immediately, before the render starts.
 *
 * The shape of `RenderJob` is intentionally identical to what the
 * `/api/render-status` route returns, so swapping the backing store doesn't
 * require changing any client code.
 *
 * Security: every job carries a random `ownerToken` (returned only at POST
 * time). Subsequent PUT/GET-status requests must present the token to prove
 * they own the job — this prevents jobId enumeration from being able to
 * read or overwrite other users' jobs.
 */

export type RenderJobStatus = 'rendering' | 'done' | 'error'

export interface RenderJob {
  id: string
  /** Random secret returned only at POST time. Required for PUT/GET-status. */
  ownerToken: string
  status: RenderJobStatus
  progress: number // 0..1
  downloadUrl?: string
  error?: string
  createdAt: number
  /** Hash of the request payload — used for idempotency dedupe. */
  dedupeHash?: string
  /** Internal local path for authenticated download streaming. */
  outputPath?: string
  /** Internal temp workspace used while the render is in flight. */
  workspacePath?: string
  /** Internal flag so a deduped POST does not start a second worker. */
  startedAt?: number
}

// Map<jobId, RenderJob>
const jobs = new Map<string, RenderJob>()

// Map<dedupeHash, jobId> — for idempotency. If the same payload is submitted
// twice within the TTL window, return the existing jobId instead of spawning
// a new render.
const dedupeIndex = new Map<string, { jobId: string; expiresAt: number }>()
const DEDUPE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Generate a cryptographically random job ID using the Web Crypto API.
 * `crypto.randomUUID()` is available in Node 19+ and all modern browsers,
 * and produces a v4 UUID — unpredictable, so attackers can't enumerate IDs.
 * Falls back to a timestamp + random hex if the API is unavailable (very
 * old runtimes).
 */
function generateJobId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `job_${crypto.randomUUID()}`
  }
  // Fallback for very old runtimes — not as strong, but better than Math.random().
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `job_${Date.now().toString(36)}_${hex}`
}

/**
 * Generate a random ownership token. This is the secret that proves a
 * request owns a job — it's returned only at POST time and must be
 * presented on PUT/GET-status. Uses the Web Crypto API for randomness.
 */
function generateOwnerToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(32) // 256 bits
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback — less random, but functional.
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

/**
 * Create a new render job. If a job with the same `dedupeHash` already exists
 * and hasn't expired, returns that job instead — this is the idempotency
 * guarantee so a double-click on "Export" doesn't spawn two renders.
 *
 * The returned job includes `ownerToken`. Callers (the API route) must
 * return the token to the client at POST time and require it on subsequent
 * PUT/GET-status requests.
 */
export function createRenderJob(dedupeHash?: string): RenderJob {
  // Idempotency check
  if (dedupeHash) {
    const existing = dedupeIndex.get(dedupeHash)
    if (existing && existing.expiresAt > Date.now()) {
      const existingJob = jobs.get(existing.jobId)
      if (existingJob && existingJob.status === 'rendering') {
        logger.info('render job deduped', {
          jobId: existing.jobId,
          dedupeHash,
        })
        return existingJob
      }
    }
  }

  const job: RenderJob = {
    id: generateJobId(),
    ownerToken: generateOwnerToken(),
    status: 'rendering',
    progress: 0,
    createdAt: Date.now(),
    dedupeHash,
  }
  jobs.set(job.id, job)
  if (dedupeHash) {
    dedupeIndex.set(dedupeHash, {
      jobId: job.id,
      expiresAt: Date.now() + DEDUPE_TTL_MS,
    })
  }
  logger.info('render job created', { jobId: job.id, dedupeHash })
  return job
}

export function getRenderJob(jobId: string): RenderJob | undefined {
  return jobs.get(jobId)
}

export function claimRenderJobStart(jobId: string): boolean {
  const job = jobs.get(jobId)
  if (!job || job.startedAt) return false
  jobs.set(jobId, { ...job, startedAt: Date.now() })
  return true
}

/**
 * Verify that `token` matches the owner token for `jobId`. Returns true
 * if the job exists and the token matches, false otherwise. This is the
 * gatekeeper for PUT/GET-status — without it, anyone who guesses or
 * enumerates a jobId could read or overwrite another user's job.
 */
export function verifyJobOwnership(jobId: string, token: string): boolean {
  const job = jobs.get(jobId)
  if (!job) return false
  // Constant-time-ish comparison to avoid timing attacks on the token.
  // Both strings are 64 hex chars (256 bits), so length is constant.
  if (job.ownerToken.length !== token.length) return false
  let diff = 0
  for (let i = 0; i < token.length; i++) {
    diff |= job.ownerToken.charCodeAt(i) ^ token.charCodeAt(i)
  }
  return diff === 0
}

export function updateRenderJob(
  jobId: string,
  patch: Partial<Omit<RenderJob, 'id' | 'createdAt' | 'ownerToken'>>,
): RenderJob | undefined {
  const job = jobs.get(jobId)
  if (!job) return undefined
  const updated: RenderJob = { ...job, ...patch }
  jobs.set(jobId, updated)
  return updated
}

/**
 * Compute a dedupe hash from the render payload. Two requests with the same
 * surah, ayat range, reciter, and settings produce the same hash, so a
 * double-click on Export returns the same jobId.
 */
export function computeDedupeHash(payload: {
  slides: { surahNumber: number; ayatNumber: number; audioUrl: string }[]
  reciterKey: string
  orientation: string
  settings: Record<string, unknown>
}): string {
  // Simple deterministic JSON hash. Good enough for dedupe — not a security
  // hash, so we don't need a cryptographic algorithm.
  const canonical = JSON.stringify({
    slides: payload.slides.map((s) => ({
      surahNumber: s.surahNumber,
      ayatNumber: s.ayatNumber,
    })),
    reciterKey: payload.reciterKey,
    orientation: payload.orientation,
    settings: payload.settings,
  })
  let hash = 0
  for (let i = 0; i < canonical.length; i++) {
    hash = ((hash << 5) - hash + canonical.charCodeAt(i)) | 0
  }
  return `h_${(hash >>> 0).toString(36)}`
}
