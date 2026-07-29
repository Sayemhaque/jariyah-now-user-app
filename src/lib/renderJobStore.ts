export interface RenderJob {
  jobId: string
  status: 'pending' | 'rendering' | 'done' | 'error'
  url: string | null
  error: string | null
  createdAt: number
}

const store = new Map<string, RenderJob>()

export function createJob(jobId: string): RenderJob {
  const job: RenderJob = {
    jobId,
    status: 'pending',
    url: null,
    error: null,
    createdAt: Date.now(),
  }
  store.set(jobId, job)
  return job
}

export function getJob(jobId: string): RenderJob | undefined {
  return store.get(jobId)
}

export function updateJob(
  jobId: string,
  updates: Partial<Pick<RenderJob, 'status' | 'url' | 'error'>>,
): RenderJob | undefined {
  const job = store.get(jobId)
  if (!job) return undefined
  Object.assign(job, updates)
  return job
}

const STALE_MS = 1_200_000 // 20 min

export function cleanupStaleJobs(): void {
  const cutoff = Date.now() - STALE_MS
  for (const [id, job] of store) {
    if (job.createdAt < cutoff) store.delete(id)
  }
}
