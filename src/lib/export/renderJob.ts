import type { AyatData, AyatSlide, Surah } from '@/lib/types'

export const pollIntervalMs = 2000

export const messageOf = (error: unknown) => (error instanceof Error ? error.message : 'Render failed')

export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const mobileUa = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  return mobileUa || (navigator.hardwareConcurrency ?? 8) <= 4
}

export function toExportSlides(ayatList: AyatData[], surah: Surah | undefined): AyatSlide[] {
  return ayatList.map((a) => ({
    arabicText: a.arabicText,
    translation: a.translation,
    transliteration: a.transliteration || '',
    surahName: surah?.name ?? '',
    surahNameArabic: surah?.arabicName ?? '',
    ayatNumber: a.ayatNumber,
    surahNumber: a.surahNumber,
    audioUrl: a.audioUrl,
    audioDurationMs: a.audioDurationMs,
  }))
}

export function downloadFile(url: string, filename: string) {
  if (!url.startsWith('blob:')) {
    window.open(url, '_blank')
    return
  }
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

async function readJson(res: Response, fallback: string) {
  if (res.ok) return res.json()
  const data = await res.json().catch(() => null)
  throw new Error(data?.error ?? `${fallback} (${res.status})`)
}

export async function startRenderJob(body: object): Promise<string> {
  const res = await fetch('/api/render/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const { jobId } = await readJson(res, 'Server error')
  if (!jobId) throw new Error('Server did not return a job ID')
  return jobId
}

export async function fetchRenderProgress(jobId: string) {
  const res = await fetch(`/api/render/progress?jobId=${encodeURIComponent(jobId)}`)
  const data = await readJson(res, 'Poll error')
  if (data.stage === 'error' || data.stage === 'expired') {
    throw new Error(data.message ?? 'Render failed or sandbox expired')
  }
  return data as { stage: string; url?: string; overallProgress?: number }
}
