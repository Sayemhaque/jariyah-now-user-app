import { describe, it, expect, beforeEach } from 'vitest'
import {
  createRenderJob,
  getRenderJob,
  updateRenderJob,
  computeDedupeHash,
} from './jobStore'

describe('computeDedupeHash', () => {
  it('returns the same hash for identical payloads', () => {
    const payload = {
      slides: [{ surahNumber: 1, ayatNumber: 1, audioUrl: 'x' }],
      reciterKey: 'Alafasy/mp3',
      orientation: 'portrait',
      settings: { foo: 'bar' },
    }
    expect(computeDedupeHash(payload)).toBe(computeDedupeHash(payload))
  })

  it('returns a different hash when the surah changes', () => {
    const base = {
      slides: [{ surahNumber: 1, ayatNumber: 1, audioUrl: 'x' }],
      reciterKey: 'Alafasy/mp3',
      orientation: 'portrait',
      settings: {},
    }
    const changed = {
      ...base,
      slides: [{ surahNumber: 2, ayatNumber: 1, audioUrl: 'x' }],
    }
    expect(computeDedupeHash(base)).not.toBe(computeDedupeHash(changed))
  })

  it('returns a different hash when the reciter changes', () => {
    const base = {
      slides: [{ surahNumber: 1, ayatNumber: 1, audioUrl: 'x' }],
      reciterKey: 'Alafasy/mp3',
      orientation: 'portrait',
      settings: {},
    }
    const changed = { ...base, reciterKey: 'Sudais/mp3' }
    expect(computeDedupeHash(base)).not.toBe(computeDedupeHash(changed))
  })

  it('ignores the audioUrl field (only surah+ayat matter for dedupe)', () => {
    const a = {
      slides: [{ surahNumber: 1, ayatNumber: 1, audioUrl: 'url-a' }],
      reciterKey: 'Alafasy/mp3',
      orientation: 'portrait',
      settings: {},
    }
    const b = {
      slides: [{ surahNumber: 1, ayatNumber: 1, audioUrl: 'url-b' }],
      reciterKey: 'Alafasy/mp3',
      orientation: 'portrait',
      settings: {},
    }
    expect(computeDedupeHash(a)).toBe(computeDedupeHash(b))
  })
})

describe('createRenderJob + getRenderJob', () => {
  it('creates a job in the rendering state with zero progress', () => {
    const job = createRenderJob()
    expect(job.status).toBe('rendering')
    expect(job.progress).toBe(0)
    expect(job.id).toMatch(/^job_/)

    const fetched = getRenderJob(job.id)
    expect(fetched?.id).toBe(job.id)
  })

  it('returns a new job for distinct dedupe hashes', () => {
    const a = createRenderJob('hash-a')
    const b = createRenderJob('hash-b')
    expect(a.id).not.toBe(b.id)
  })

  it('returns the same job when the dedupe hash matches and the job is still rendering', () => {
    const a = createRenderJob('hash-same')
    const b = createRenderJob('hash-same')
    expect(a.id).toBe(b.id)
  })

  it('creates a new job when the dedupe hash matches but the previous job finished', () => {
    const a = createRenderJob('hash-finished')
    updateRenderJob(a.id, { status: 'done', progress: 1 })
    const b = createRenderJob('hash-finished')
    expect(a.id).not.toBe(b.id)
  })
})

describe('updateRenderJob', () => {
  it('updates progress + status', () => {
    const job = createRenderJob()
    const updated = updateRenderJob(job.id, {
      progress: 0.5,
      status: 'rendering',
    })
    expect(updated?.progress).toBe(0.5)
    expect(updated?.status).toBe('rendering')
  })

  it('sets the downloadUrl on completion', () => {
    const job = createRenderJob()
    const updated = updateRenderJob(job.id, {
      status: 'done',
      progress: 1,
      downloadUrl: 'blob:abc',
    })
    expect(updated?.downloadUrl).toBe('blob:abc')
    expect(updated?.status).toBe('done')
  })

  it('sets the error message on failure', () => {
    const job = createRenderJob()
    const updated = updateRenderJob(job.id, {
      status: 'error',
      error: 'decodeAudioData failed',
    })
    expect(updated?.status).toBe('error')
    expect(updated?.error).toBe('decodeAudioData failed')
  })

  it('returns undefined for an unknown jobId', () => {
    expect(updateRenderJob('nonexistent', { progress: 0.5 })).toBeUndefined()
  })
})
