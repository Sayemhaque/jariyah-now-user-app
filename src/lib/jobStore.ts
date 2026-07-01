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
 */

export type RenderJobStatus = 'rendering' | 'done' | 'error'

export interface RenderJob {
  id: string
  status: RenderJobStatus
  progress: number // 0..1
  downloadUrl?: string
  error?: string
  createdAt: number
  /** Hash of the request payload — used for idempotency dedupe. */
  dedupeHash?: string
}

// Map<jobId, RenderJob>
const jobs = new Map<string, RenderJob>()

// Map<dedupeHash, jobId> — for idempotency. If the same payload is submitted
// twice within the TTL window, return the existing jobId instead of spawning
// a new render.
const dedupeIndex = new Map<string, { jobId: string; expiresAt: number }>()
const DEDUPE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Generate a stable-ish job ID. Not a UUID (we don't want to add a dep just
 * for this) but unique enough for a single-process job store.
 */
function generateJobId(): string {
  return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Create a new render job. If a job with the same `dedupeHash` already exists
 * and hasn't expired, returns that job instead — this is the idempotency
 * guarantee so a double-click on "Export" doesn't spawn two renders.
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

export function updateRenderJob(
  jobId: string,
  patch: Partial<Omit<RenderJob, 'id' | 'createdAt'>>,
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
