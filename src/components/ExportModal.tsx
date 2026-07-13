'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import NextImage from 'next/image'
import { Download, Film, X, CheckCircle2, AlertCircle, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import { RECITERS as RECITERS_LIST } from '@/lib/reciters'
import { videoAttributionLine } from '@/lib/translations'
import { RENDER_QUALITY_SCALE } from '@/remotion/types'
import { InstagramIcon, YouTubeIcon, YouTubeShortsIcon } from '@/components/PlatformIcons'
import type { AyatSlide, ExportOptions, Orientation, VideoSettings } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const PLATFORM_PRESETS: {
  key: ExportOptions['platform']
  label: string
  hint: string
  orientation: Orientation
  icon: React.ComponentType<{ className?: string }>
  color: string
}[] = [
  { key: 'reel', label: 'Instagram Reel', hint: '1080×1920 · portrait · convert to MP4', orientation: 'portrait', icon: InstagramIcon, color: '#e1306c' },
  { key: 'shorts', label: 'YouTube Shorts', hint: '1080×1920 · portrait · WebM ok', orientation: 'portrait', icon: YouTubeShortsIcon, color: '#ff0000' },
  { key: 'youtube', label: 'YouTube', hint: '1920×1080 · landscape · WebM ok', orientation: 'landscape', icon: YouTubeIcon, color: '#ff0000' },
]

const RES: Record<Orientation, { w: number; h: number }> = {
  landscape: { w: 1280, h: 720 },
  portrait: { w: 720, h: 1280 },
}

type RenderStatus = 'idle' | 'processing' | 'done' | 'error'

interface ExportModalProps {
  open: boolean
  onOpenChange: (o: boolean) => void
}

/**
 * Custom video preview player with proper controls (play/pause, seek bar,
 * time display, volume). Replaces the bare <video controls> which showed
 * 0:00 / 0:00 until metadata loaded and had no visible duration.
 */
function VideoPreviewPlayer({
  src,
  orientation,
  filename,
  isMp4,
}: {
  src: string
  orientation: Orientation
  filename: string
  isMp4: boolean
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => setCurrentTime(v.currentTime)
    const onDur = () => setDuration(v.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onDur)
    v.addEventListener('durationchange', onDur)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    // Auto-play muted on load so the user sees motion immediately
    v.muted = true
    v.play().catch(() => {})
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onDur)
      v.removeEventListener('durationchange', onDur)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [src])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
  }

  const onSeek = (val: number[]) => {
    const v = videoRef.current
    if (!v || !duration) return
    v.currentTime = (val[0]! / 100) * duration
    setCurrentTime(v.currentTime)
  }

  const onVol = (val: number[]) => {
    const v = videoRef.current
    if (!v) return
    const vol = val[0]! / 100
    v.volume = vol
    v.muted = vol === 0
    setVolume(vol)
    setMuted(vol === 0)
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-primary px-1">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">Video ready!</span>
        <span className="text-xs text-muted-foreground ml-auto font-mono">
          {formatMs(duration * 1000)}
        </span>
      </div>

      {/* Video + custom controls overlay */}
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          preload="auto"
          playsInline
          loop
          onClick={togglePlay}
          className={`w-full block ${orientation === 'portrait' ? 'aspect-[9/16]' : 'aspect-video'}`}
        >
          <source
            src={src}
            type={
              isMp4
                ? 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
                : 'video/webm'
            }
          />
        </video>

        {/* Center play/pause button overlay */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 grid place-items-center bg-black/30 transition"
            aria-label="Play"
          >
            <div className="grid place-items-center h-14 w-14 rounded-full bg-primary/90 text-primary-foreground shadow-lg">
              <Play className="h-7 w-7 translate-x-0.5" />
            </div>
          </button>
        )}
      </div>

      {/* Custom controls bar */}
      <div className="flex items-center gap-2 px-1">
        <button
          onClick={togglePlay}
          className="grid place-items-center h-8 w-8 rounded-lg hover:bg-muted shrink-0"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
        </button>

        {/* Seek bar */}
        <Slider
          value={[pct]}
          max={100}
          step={0.1}
          onValueChange={onSeek}
          className="flex-1"
        />

        {/* Time display */}
        <span className="text-xs font-mono tabular-nums text-muted-foreground whitespace-nowrap shrink-0">
          {formatMs(currentTime * 1000)} / {formatMs(duration * 1000)}
        </span>

        {/* Volume */}
        <button
          onClick={toggleMute}
          className="grid place-items-center h-8 w-8 rounded-lg hover:bg-muted shrink-0"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <Slider
          value={[muted ? 0 : volume * 100]}
          max={100}
          step={1}
          onValueChange={onVol}
          className="w-16 shrink-0"
        />
      </div>

      {/* Download button */}
      <a
        href={src}
        download={filename}
        className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl qv-btn-primary text-sm font-semibold"
      >
        <Download className="h-4 w-4" />
        Download {filename}
      </a>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────
// ProcessingPanel — premium animated processing state
// ──────────────────────────────────────────────────────────────────────
// Shown during the entire WebM render + MP4 conversion pipeline.
// ONE unified 0–100% progress bar (no reset between phases).
// The sub-phase label cross-fades between stages so the user always
// knows what's happening. Heavy use of CSS animations defined in
// globals.css: gradient pan, ring spin, pulse glow, shimmer, bar glow.

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

  const [platform, setPlatform] = useState<ExportOptions['platform']>('reel')
  const [quality, setQuality] = useState<ExportOptions['quality']>(() => isMobile ? '480p' : '720p')
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

  //
  const stopRef = useRef<(() => void) | null>(null)
  const jobIdRef = useRef<string | null>(null)
  const ownerTokenRef = useRef<string | null>(null)

  // When platform changes, also update the global orientation so the
  // export resolution matches what the user just picked.
  useEffect(() => {
    if (!open) return
    const preset = PLATFORM_PRESETS.find((p) => p.key === platform)
    if (preset && preset.orientation !== settings.orientation) {
      updateSettings({ orientation: preset.orientation })
    }
  }, [platform, open, settings.orientation, updateSettings])

  const totalMs = useMemo(
    () => ayatList.reduce((s, a) => s + (a.audioDurationMs || 0), 0),
    [ayatList],
  )
  const effectiveQuality = quality

  const filename = useMemo(() => {
    const s = surah?.number ?? 0
    const ext = isMp4 ? 'mp4' : 'webm'
    return `quran-${s}-ayat-${fromAyat}-${toAyat}-${reciter.id}.${ext}`
  }, [surah, fromAyat, toAyat, reciter.id, isMp4])

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      if (stopRef.current) stopRef.current()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('idle')
      setProgress(0)
      setDownloadUrl(null)
      setErrorMsg(null)
      setProcessingPhase('composing')
      jobIdRef.current = null
      ownerTokenRef.current = null
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
  const handleDownload = async () => {
    if (!downloadUrl) return

    if (downloadUrl.startsWith('/api/render-download') && ownerTokenRef.current) {
      const response = await fetch(downloadUrl, {
        headers: { 'x-owner-token': ownerTokenRef.current },
      })
      if (!response.ok) {
        throw new Error('Failed to download the rendered MP4 from the server.')
      }
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
      return
    }

    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const startRender = async () => {
    if (!slides.length) return
    setStatus('processing')
    setProcessingPhase('composing')
    setProgress(0)
    setErrorMsg(null)
    setDownloadUrl(null)
    jobIdRef.current = null
    ownerTokenRef.current = null

    const requestBody = {
      slides,
      reciterKey: reciter.audioKey,
      reciterName: reciter.name,
      attributionLine: videoAttributionLine(translationKey),
      quality: effectiveQuality,
      settings,
      orientation: settings.orientation,
    }

    const phaseFromServerProgress = (value: number): ProcessingPhase => {
      if (value < 0.15) return 'composing'
      if (value < 0.5) return 'uploading'
      if (value < 0.7) return 'encoding'
      return 'finalizing'
    }

    // POST /api/render — starts the server-side Remotion render, creates a
    // render job, and returns a jobId + ownerToken for progress polling.
    let jobId: string | null = null
    let ownerToken: string | null = null
    try {
      const r = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      if (!r.ok) {
        const errorBody = (await r.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(errorBody?.error || 'Failed to start the render.')
      }
      const okBody = (await r.json()) as { jobId: string; ownerToken: string }
      jobId = okBody.jobId
      ownerToken = okBody.ownerToken
      jobIdRef.current = jobId
      ownerTokenRef.current = ownerToken
    } catch {
      setStatus('error')
      setErrorMsg('Failed to start the server render job.')
      toast.error('Failed to start the server render job.')
      return
    }

    if (!jobId || !ownerToken) {
      setStatus('error')
      setErrorMsg('The render job did not return an owner token.')
      toast.error('The render job did not return an owner token.')
      return
    }

    try {
      for (;;) {
        const response = await fetch(
          `/api/render-status?jobId=${encodeURIComponent(jobId)}`,
          {
            headers: { 'x-owner-token': ownerToken },
            cache: 'no-store',
          },
        )
        const statusBody = (await response.json()) as {
          status?: 'rendering' | 'done' | 'error'
          progress?: number
          downloadUrl?: string
          error?: string
        }

        if (!response.ok) {
          throw new Error(statusBody.error || 'Failed to poll render status.')
        }

        const nextProgress = Math.max(0, Math.min(1, statusBody.progress ?? 0))
        setProgress(nextProgress)
        setProcessingPhase(phaseFromServerProgress(nextProgress))

        if (statusBody.status === 'done' && statusBody.downloadUrl) {
          setStatus('done')
          setDownloadUrl(statusBody.downloadUrl)
          setProgress(1)
          setProcessingPhase('finalizing')
          toast.success('Video ready as MP4!')
          return
        }

        if (statusBody.status === 'error') {
          throw new Error(statusBody.error || 'Server render failed.')
        }

        await new Promise((resolve) => window.setTimeout(resolve, 1500))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Server render failed'
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
              Pick a platform preset, choose quality, then render.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* All exports run server-side via Remotion — no browser capability
            checks needed, and all background types (image/video) are supported. */}

        {/* Two-column body on desktop, single column on mobile */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

            {/* ─── LEFT: Settings ─── */}
            <div className="space-y-4">
              {/* Platform */}
              <div className="space-y-2">
                <Label className="qv-section-title !mb-0">Platform</Label>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {PLATFORM_PRESETS.map((p) => {
                    const Icon = p.icon
                    return (
                      <button
                        key={p.key}
                        onClick={() => setPlatform(p.key)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 text-left transition',
                          platform === p.key
                            ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20'
                            : 'border-border bg-card hover:border-foreground/30',
                        )}
                      >
                        <div
                          className="grid place-items-center h-8 w-8 rounded-lg shrink-0"
                          style={{ backgroundColor: `${p.color}15`, color: p.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium leading-tight">{p.label}</div>
                          <div className="text-[9px] sm:text-[10px] text-muted-foreground tabular-nums leading-tight mt-0.5">
                            {p.hint}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

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
                      {Math.round(RES[settings.orientation].w * RENDER_QUALITY_SCALE[effectiveQuality])} ×{' '}
                      {Math.round(RES[settings.orientation].h * RENDER_QUALITY_SCALE[effectiveQuality])}
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
                      to start the server render.
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
                  onDownload={() => {
                    void handleDownload().catch((error) => {
                      const msg =
                        error instanceof Error ? error.message : 'Download failed'
                      toast.error(msg)
                    })
                  }}
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

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00'
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
