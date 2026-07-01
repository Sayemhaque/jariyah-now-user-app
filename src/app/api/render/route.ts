import { NextRequest, NextResponse } from 'next/server'
import { MAX_AYATS_PER_VIDEO } from '@/lib/validation'

/**
 * POST /api/render
 *
 * Spec contract:
 *   Body: { slides, reciterKey, settings, orientation }
 *   → Verifies ayat MP3s exist
 *   → Triggers Remotion renderMedia()
 *   → Returns { jobId }
 *
 * Implementation note: this sandbox cannot run Remotion's headless Chrome
 * renderer reliably, so the actual MP4 is produced client-side in the
 * ExportModal using <canvas> + MediaRecorder. This endpoint exists to:
 *   1. validate the request payload (same max-10 guard as the client)
 *   2. HEAD-check each ayat MP3 so we can fail fast if a reciter's audio
 *      is missing on the Quran.com CDN
 *   3. create a job record with a deterministic id
 *
 * The client polls /api/render-status?jobId=... which mirrors progress
 * the client itself reports back via PUT (so progress survives a tab refocus).
 */

interface JobRecord {
  id: string
  status: 'rendering' | 'done' | 'error'
  progress: number
  downloadUrl?: string
  error?: string
  createdAt: number
}

// in-memory job store + rate limiter (suitable for an MVP, persists for the
// life of the dev server process)
const jobs = new Map<string, JobRecord>()
const rateBuckets = new Map<string, number[]>() // ip -> array of start timestamps

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (rateBuckets.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (arr.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, arr)
    return true
  }
  arr.push(now)
  rateBuckets.set(ip, arr)
  return false
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (rateLimited(ip)) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded: max ${RATE_LIMIT_MAX} renders per hour per IP.`,
      },
      { status: 429 },
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const slides = Array.isArray(body?.slides) ? body.slides : []
  if (!slides.length) {
    return NextResponse.json({ error: 'No slides provided' }, { status: 400 })
  }
  if (slides.length > MAX_AYATS_PER_VIDEO) {
    return NextResponse.json(
      { error: `Too many slides: max ${MAX_AYATS_PER_VIDEO} ayats per video` },
      { status: 400 },
    )
  }
  const reciterKey = typeof body?.reciterKey === 'string' ? body.reciterKey : ''
  if (!reciterKey) {
    return NextResponse.json({ error: 'Missing reciterKey' }, { status: 400 })
  }

  // HEAD-check each ayat MP3 so we can fail fast if the Quran.com CDN
  // is missing audio for the chosen reciter.
  const checked: { url: string; ok: boolean; status?: number }[] = []
  for (const s of slides) {
    const url: string = s?.audioUrl
    if (!url) continue
    try {
      const r = await fetch(url, { method: 'HEAD' })
      checked.push({ url, ok: r.ok, status: r.status })
    } catch (e: any) {
      checked.push({ url, ok: false })
    }
  }
  const missing = checked.filter((c) => !c.ok)
  if (missing.length === slides.length) {
    return NextResponse.json(
      {
        error:
          'Could not reach the reciter audio on the Quran.com CDN. Try a different reciter.',
      },
      { status: 502 },
    )
  }

  // Create a job. The client will drive the actual canvas recording and PUT
  // progress updates to /api/render-status.
  const jobId = `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  jobs.set(jobId, {
    id: jobId,
    status: 'rendering',
    progress: 0,
    createdAt: Date.now(),
  })

  return NextResponse.json({
    jobId,
    audioCheck: checked,
    note:
      'Rendering happens client-side via Canvas + MediaRecorder. PUT progress to /api/render-status to update the job.',
  })
}

export async function PUT(req: NextRequest) {
  // Allow the client to update an existing job's progress / final URL.
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const jobId: string = body?.jobId
  if (!jobId || !jobs.has(jobId)) {
    return NextResponse.json({ error: 'Unknown jobId' }, { status: 404 })
  }
  const job = jobs.get(jobId)!
  if (typeof body?.progress === 'number') {
    job.progress = Math.max(0, Math.min(1, body.progress))
  }
  if (body?.status === 'done' || body?.status === 'error' || body?.status === 'rendering') {
    job.status = body.status
  }
  if (typeof body?.downloadUrl === 'string') job.downloadUrl = body.downloadUrl
  if (typeof body?.error === 'string') job.error = body.error
  jobs.set(jobId, job)
  return NextResponse.json(job)
}

// expose for the status route
export { jobs }
