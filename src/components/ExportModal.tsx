'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import NextImage from 'next/image'
import { Download, Film, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import { RECITERS as RECITERS_LIST } from '@/lib/reciters'
import { videoAttributionLine } from '@/lib/translations'
import { formatMs } from '@/lib/format'
import type { AyatSlide, Orientation } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const RES: Record<string, { w: number; h: number }> = {
  landscape: { w: 1280, h: 720 },
  portrait: { w: 720, h: 1280 },
}

const QUALITY_SCALE: Record<string, number> = {
  '480p': 0.667,
  '720p': 1,
  '1080p': 1.5,
}

type RenderStatus = 'idle' | 'processing' | 'done' | 'error'

interface ExportModalProps {
  open: boolean
  onOpenChange: (o: boolean) => void
}

// ──────────────────────────────────────────────────────────────────────
// ProcessingPanel — premium animated processing state
// ──────────────────────────────────────────────────────────────────────

type ProcessingPhase = 'composing' | 'uploading' | 'encoding' | 'finalizing'

const PHASE_LABELS: Record<ProcessingPhase, { title: string; subtitle: string }> = {
  composing: {
    title: 'Preparing render',
    subtitle: 'Staging assets and validating the export job',
  },
  uploading: {
    title: 'Building audio',
    subtitle: 'Collecting recitation audio and preparing the timeline',
  },
  encoding: {
    title: 'Encoding video',
    subtitle: 'Compositing the background, overlays, and final audio',
  },
  finalizing: {
    title: 'Finalizing',
    subtitle: 'Almost done — preparing the finished MP4 download',
  },
}

function ProcessingPanel({
  progress,
  phase,
  isMp4,
}: {
  progress: number
  phase: ProcessingPhase
  isMp4: boolean
}) {
  const pct = Math.min(100, Math.max(0, Math.round(progress * 100)))
  const { title, subtitle } = PHASE_LABELS[phase]

  return (
    <div className="qv-processing-panel relative rounded-2xl border border-primary/20 overflow-hidden min-h-[320px] flex flex-col justify-center p-6 sm:p-8">
      {/* Decorative top-left + bottom-right gradient blobs for depth */}
      <div
        aria-hidden
        className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
      />

      {/* ─── Top: spinning ring + pulsing logo ─── */}
      <div className="relative mx-auto mb-6">
        {/* Pulsing glow halo */}
        <div
          aria-hidden
          className="qv-processing-glow absolute inset-0 rounded-full bg-primary/30 blur-xl"
        />
        {/* Spinning conic ring */}
        <div className="qv-processing-ring absolute inset-0 rounded-full" />
        {/* Center logo */}
        <div className="relative grid place-items-center h-20 w-20 rounded-full bg-card shadow-lg">
          <NextImage
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        </div>
      </div>

      {/* ─── Phase label (cross-fades on change) ─── */}
      <div className="text-center mb-5 min-h-[44px]">
        <p
          key={phase}
          className="qv-phase-label font-semibold text-base text-foreground"
        >
          {title}
          <span className="inline-flex ml-1.5 align-middle">
            <span className="qv-dot inline-block h-1.5 w-1.5 rounded-full bg-primary mx-0.5" />
            <span className="qv-dot inline-block h-1.5 w-1.5 rounded-full bg-primary mx-0.5" />
            <span className="qv-dot inline-block h-1.5 w-1.5 rounded-full bg-primary mx-0.5" />
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {/* ─── Unified progress bar ─── */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {isMp4 ? 'MP4' : 'WebM'} · Processing
          </span>
          <span
            className="font-mono font-bold text-lg text-primary tabular-nums"
            style={{ textShadow: '0 0 12px hsl(var(--primary) / 0.4)' }}
          >
            {pct}%
          </span>
        </div>

        {/* Track */}
        <div className="relative h-2.5 rounded-full bg-muted/80 overflow-hidden ring-1 ring-inset ring-border">
          {/* Fill */}
          <div
            className="qv-processing-bar relative h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          >
            {/* Shimmer overlay */}
            <div
              aria-hidden
              className="qv-processing-shimmer absolute inset-0 rounded-full"
            />
          </div>
        </div>

        {/* Phase dots — 4 stages, current one highlighted */}
        <div className="flex items-center justify-between pt-1.5">
          {(['composing', 'uploading', 'encoding', 'finalizing'] as const).map(
            (p, i) => {
              const phaseOrder: ProcessingPhase[] = [
                'composing',
                'uploading',
                'encoding',
                'finalizing',
              ]
              const currentIdx = phaseOrder.indexOf(phase)
              const isPast = i < currentIdx
              const isCurrent = i === currentIdx
              return (
                <div key={p} className="flex items-center">
                  <div
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? 'bg-primary scale-150 shadow-[0_0_8px_var(--primary)]'
                        : isPast
                          ? 'bg-primary/60'
                          : 'bg-muted-foreground/30'
                    }`}
                  />
                  {i < 3 && (
                    <div
                      className={`h-px w-6 transition-colors duration-300 ${
                        i < currentIdx ? 'bg-primary/40' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              )
            },
          )}
        </div>
      </div>

      {/* ─── Footer note ─── */}
      <p className="text-center text-[10px] text-muted-foreground/70 mt-5">
        Do not close this tab while processing
      </p>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────
// DonePanel — clean success state with just a download button
// ──────────────────────────────────────────────────────────────────────
// Replaces the old VideoPreviewPlayer in the done state. No big video
// preview — the user already saw the video in the live preview, so the
// modal's job here is just to hand them the file. Compact, focused,
// with a prominent download button.

function DonePanel({
  filename,
  isMp4,
  orientation,
  onDownload,
}: {
  filename: string
  isMp4: boolean
  orientation: Orientation
  onDownload: () => void
}) {
  return (
    <div className="qv-processing-panel relative rounded-2xl border border-primary/20 overflow-hidden min-h-[280px] flex flex-col justify-center p-6 sm:p-8 text-center">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
      />

      {/* Success checkmark with pulse */}
      <div className="relative mx-auto mb-5">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl qv-processing-glow"
        />
        <div className="relative grid place-items-center h-16 w-16 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="h-9 w-9 text-white" />
        </div>
      </div>

      <div className="relative space-y-1.5 mb-6">
        <p className="font-bold text-lg text-foreground">Video ready!</p>
        <p className="text-xs text-muted-foreground">
          Your video has been processed as {isMp4 ? 'MP4' : 'WebM'} ·{' '}
          {orientation === 'portrait'
            ? 'Portrait 9:16'
            : orientation === 'landscape'
              ? 'Landscape 16:9'
              : 'Square 1:1'}
        </p>
      </div>

      {/* Download button — the primary CTA */}
      <button
        type="button"
        onClick={onDownload}
        className="qv-btn-primary relative inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl text-base font-semibold"
      >
        <Download className="h-5 w-5" />
        Download {filename}
      </button>

      {/* Format badge */}
      <div className="relative flex items-center justify-center gap-2 mt-4">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isMp4
              ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
          }`}
        >
          {isMp4 ? 'MP4 · H.264' : 'WebM fallback'}
        </span>
      </div>
    </div>
  )
}

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const ayatList = useBuilderStore((s) => s.ayatList)
  const surahs = useBuilderStore((s) => s.surahs)
  const selectedSurahNumber = useBuilderStore((s) => s.selectedSurahNumber)
  const reciterId = useBuilderStore((s) => s.reciterId)
  const translationKey = useBuilderStore((s) => s.translationKey)
  const settings = useBuilderStore((s) => s.settings)
  const updateSettings = useBuilderStore((s) => s.updateSettings)
  const fromAyat = useBuilderStore((s) => s.fromAyat)
  const toAyat = useBuilderStore((s) => s.toAyat)

  // Derive surah + reciter with stable references.
  const surah = useMemo(
    () => surahs.find((s) => s.number === selectedSurahNumber),
    [surahs, selectedSurahNumber],
  )
  const reciter = useMemo(
    () => RECITERS_LIST.find((r) => r.id === reciterId) ?? RECITERS_LIST[0]!,
    [reciterId],
  )

  const isMobile = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent
    const mobileUa = /Mobile|Android|iPhone|iPad|iPod/i.test(ua)
    const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4
    return mobileUa || fewCores
  }, [])

  const [quality, setQuality] = useState<'480p' | '720p' | '1080p'>(() => isMobile ? '480p' : '720p')
  const [status, setStatus] = useState<RenderStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  // Server always returns MP4 — no format toggle needed.
  const isMp4 = true
  // Sub-phase of the unified "processing" state, so the UI can show a
  // contextual label ("Composing frames…" / "Encoding to MP4…") without
  // splitting the progress bar.
  const [processingPhase, setProcessingPhase] = useState<
    'composing' | 'uploading' | 'encoding' | 'finalizing'
  >('composing')

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalMs = useMemo(
    () => ayatList.reduce((s, a) => s + (a.audioDurationMs || 0), 0),
    [ayatList],
  )
  const effectiveQuality = quality

  const filename = useMemo(() => {
    const s = surah?.number ?? 0
    return `quran-${s}-ayat-${fromAyat}-${toAyat}-${reciter.id}.mp4`
  }, [surah, fromAyat, toAyat, reciter.id])

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      if (pollingRef.current) clearInterval(pollingRef.current)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('idle')
      setProgress(0)
      setDownloadUrl(null)
      setErrorMsg(null)
      setProcessingPhase('composing')
    }
  }, [open])

  // Build AyatSlide[] for the renderer
  const slides: AyatSlide[] = useMemo(
    () =>
      ayatList.map((a) => ({
        arabicText: a.arabicText,
        translation: a.translation,
        transliteration: a.transliteration || '',
        surahName: surah?.name ?? '',
        surahNameArabic: surah?.arabicName ?? '',
        ayatNumber: a.ayatNumber,
        surahNumber: a.surahNumber,
        audioUrl: a.audioUrl,
        audioDurationMs: a.audioDurationMs,
      })),
    [ayatList, surah],
  )

  // ----------------- PROCESS -----------------
  // The whole pipeline (WebM render + MP4 conversion) is exposed to the
  // user as a SINGLE "processing" state with one unified 0–100% progress
  // bar. The WebM render fills 0–60%, the MP4 conversion fills 60–100%.
  // The sub-phase (`processingPhase`) drives the label only — it does
  // NOT split the progress.
  const handleDownload = () => {
    if (!downloadUrl) return
    if (downloadUrl.startsWith('blob:')) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
    } else {
      window.open(downloadUrl, '_blank')
    }
  }

  const mapStageToPhase = (stage: string, overallProgress: number) => {
    switch (stage) {
      case 'starting':
        setProcessingPhase('composing')
        setProgress(Math.min(0.1, overallProgress ?? 0))
        break
      case 'opening-browser':
      case 'selecting-composition':
        setProcessingPhase('uploading')
        setProgress(0.1 + (overallProgress ?? 0) * 0.1)
        break
      case 'render-progress':
        setProcessingPhase('encoding')
        setProgress(0.2 + (overallProgress ?? 0) * 0.75)
        break
      case 'uploading':
        setProcessingPhase('finalizing')
        setProgress(0.95 + (overallProgress ?? 0) * 0.04)
        break
      case 'done':
        setProcessingPhase('finalizing')
        setProgress(1)
        break
    }
  }

  const startRender = async () => {
    if (!slides.length) return
    setStatus('processing')
    setProcessingPhase('composing')
    setProgress(0)
    setErrorMsg(null)
    setDownloadUrl(null)

    try {
      setProcessingPhase('uploading')
      const res = await fetch('/api/render/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides,
          settings,
          orientation: settings.orientation,
          reciterName: reciter.name,
          attributionLine: videoAttributionLine(translationKey),
          surahName: surah?.name ?? '',
          surahNameArabic: surah?.arabicName ?? '',
          totalAyats: slides.length,
          quality: effectiveQuality,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error ?? `Server error (${res.status})`)
      }

      const { jobId } = await res.json()
      if (!jobId) {
        throw new Error('Server did not return a job ID')
      }

      const poll = () => {
        pollingRef.current = setInterval(async () => {
          try {
            const progRes = await fetch(
              `/api/render/progress?jobId=${encodeURIComponent(jobId)}`,
            )
            if (!progRes.ok) {
              clearInterval(pollingRef.current!)
              const errData = await progRes.json().catch(() => null)
              throw new Error(errData?.error ?? `Poll error (${progRes.status})`)
            }

            const data = await progRes.json()

            if (data.stage === 'done') {
              clearInterval(pollingRef.current!)
              setDownloadUrl(data.url)
              setStatus('done')
              setProgress(1)
              setProcessingPhase('finalizing')
              toast.success('Video ready as MP4!')
              return
            }

            if (data.stage === 'error' || data.stage === 'expired') {
              clearInterval(pollingRef.current!)
              throw new Error(data.message ?? 'Render failed or sandbox expired')
            }

            mapStageToPhase(data.stage, data.overallProgress ?? 0)
          } catch (pollErr) {
            clearInterval(pollingRef.current!)
            const msg = pollErr instanceof Error ? pollErr.message : 'Render failed'
            setStatus('error')
            setErrorMsg(msg)
            toast.error(msg)
          }
        }, 2000)
      }

      poll()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Render failed'
      setStatus('error')
      setErrorMsg(msg)
      toast.error(msg)
    }
  }

  const estimatedDuration = formatMs(totalMs)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl w-[95vw] h-[90vh] bg-card border-border shadow-xl sm:rounded-2xl p-0 max-sm:h-[100dvh] max-sm:w-screen max-sm:max-w-none max-sm:rounded-none flex flex-col overflow-hidden gap-0">
        {/* Header — full width */}
        <div className="px-6 pt-6 shrink-0">
          <DialogHeader className="mb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary/15 text-primary shrink-0">
                <Film className="h-4 w-4" />
              </div>
              Export video
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Rendered on the server as H.264 MP4.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* All exports run in-browser via WebCodecs + Canvas — no server needed. */}

        {/* Two-column body on desktop, single column on mobile */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

            {/* ─── LEFT: Settings ─── */}
            <div className="space-y-4">
              {/* Quality */}
              <div className="space-y-2">
                <Label className="qv-section-title !mb-0">Quality</Label>
                {isMobile && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
                    Mobile export may be slow. For best results, use a desktop browser.
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {(['480p', '720p', '1080p'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={cn(
                        'rounded-xl border p-2.5 sm:p-3 text-sm font-medium transition',
                        effectiveQuality === q
                          ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                          : 'border-border bg-card hover:border-foreground/30',
                      )}
                    >
                      {q}
                      {q === '1080p' && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider opacity-70">
                          HD
                        </span>
                      )}
                      {q === '480p' && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider opacity-70">
                          Lite
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="qv-card rounded-xl p-3 sm:p-3.5 text-[13px]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <div className="col-span-2 flex justify-between items-center gap-2 pb-2 border-b border-border">
                    <span className="text-muted-foreground text-xs">Filename</span>
                    <span className="font-mono text-[11px] text-foreground/85 truncate max-w-[60%]">
                      {filename}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Duration</span>
                    <span className="font-mono tabular-nums text-xs">{estimatedDuration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Ayats</span>
                    <span className="tabular-nums text-xs">{slides.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Resolution</span>
                    <span className="font-mono tabular-nums text-xs">
                      {Math.round(RES[settings.orientation]!.w * QUALITY_SCALE[effectiveQuality])} ×{' '}
                      {Math.round(RES[settings.orientation]!.h * QUALITY_SCALE[effectiveQuality])}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Format</span>
                    <span className="font-mono tabular-nums text-xs">
                      MP4
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RIGHT: Output / Processing / Download ─── */}
            <div className="space-y-4">
              {/* Idle state — show a placeholder */}
              {status === 'idle' && (
                <div className="qv-card rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[280px] gap-3">
                  <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary/10 text-primary">
                    <Film className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Ready to process</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[240px]">
                      Pick your settings on the left, then hit{' '}
                      <span className="font-medium text-foreground">Process video</span>{' '}
                      to render directly in your browser.
                    </p>
                  </div>
                </div>
              )}

              {/* Processing state — premium animated UI.
                  A SINGLE unified 0–100% progress bar spans the WebM render
                  (0–60%) AND the MP4 conversion (60–100%). The sub-phase
                  label cross-fades between stages so the user always knows
                  what's happening, without splitting the progress bar. */}
              {status === 'processing' && (
                <ProcessingPanel
                  progress={progress}
                  phase={processingPhase}
                  isMp4={isMp4}
                />
              )}

              {/* Done state — success panel + download button.
                  No big video preview — just a clean success state with
                  a prominent download button. The user already saw the
                  video in the live preview; the modal's job here is to
                  hand them the file. */}
              {status === 'done' && downloadUrl && (
                <DonePanel
                  filename={filename}
                  isMp4={isMp4}
                  orientation={settings.orientation}
                  onDownload={handleDownload}
                />
              )}

              {/* Error state */}
              {status === 'error' && (
                <div className="qv-card rounded-xl p-5 min-h-[280px] flex flex-col justify-center">
                  <div className="flex items-start gap-3 text-sm text-destructive">
                    <AlertCircle className="h-6 w-6 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-medium">Processing failed</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{errorMsg}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-border bg-card px-6 py-3 flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
            <X className="h-4 w-4 mr-1.5" />
            Close
          </Button>
          {status !== 'processing' && (
            <Button
              onClick={startRender}
              disabled={!slides.length}
              className="qv-btn-primary flex-1"
            >
              <Film className="h-4 w-4 mr-1.5" />
              {status === 'done' ? 'Process again' : 'Process video'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
