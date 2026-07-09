'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Film, X, CheckCircle2, AlertCircle, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import { RECITERS as RECITERS_LIST } from '@/lib/reciters'
import { paintOverlayOnCanvas } from '@/lib/overlay'
import { videoAttributionLine } from '@/lib/translations'
import {
  checkExportCapabilities,
  pickSupportedMimeType,
} from '@/lib/exportCapabilities'
import { webmToMp4, canConvertToMp4 } from '@/lib/videoConverter'
import { InstagramIcon, YouTubeIcon, YouTubeShortsIcon } from '@/components/PlatformIcons'
import type { AyatSlide, ExportOptions, Orientation } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
    title: 'Composing frames',
    subtitle: 'Rendering the canvas, frame by frame',
  },
  uploading: {
    title: 'Preparing for conversion',
    subtitle: 'Sending to the Python + ffmpeg encoder',
  },
  encoding: {
    title: 'Encoding to MP4',
    subtitle: 'H.264 + AAC, optimized for every platform',
  },
  finalizing: {
    title: 'Finalizing',
    subtitle: 'Almost done — preparing your download',
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
          <img
            src="/logo.png"
            alt=""
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
  downloadUrl,
  filename,
  isMp4,
  orientation,
}: {
  downloadUrl: string
  filename: string
  isMp4: boolean
  orientation: Orientation
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
      <a
        href={downloadUrl}
        download={filename}
        className="qv-btn-primary relative inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl text-base font-semibold"
      >
        <Download className="h-5 w-5" />
        Download {filename}
      </a>

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

  const [platform, setPlatform] = useState<ExportOptions['platform']>('reel')
  const [quality, setQuality] = useState<ExportOptions['quality']>('720p')
  const [status, setStatus] = useState<RenderStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  // Tracks whether the final downloadable file is MP4 (true) or WebM
  // (false, only when MP4 conversion fails). Drives the format badge in
  // the processing UI + the download filename extension.
  const [isMp4, setIsMp4] = useState(true)
  // Sub-phase of the unified "processing" state, so the UI can show a
  // contextual label ("Composing frames…" / "Encoding to MP4…") without
  // splitting the progress bar.
  const [processingPhase, setProcessingPhase] = useState<
    'composing' | 'uploading' | 'encoding' | 'finalizing'
  >('composing')

  // Pre-flight check: does this browser support MediaRecorder + Canvas
  // capture + AudioContext? If not, we show a clear message instead of
  // letting the render crash mid-way with a generic "Render failed" toast.
  const capabilities = useMemo(() => checkExportCapabilities(), [])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stopRef = useRef<(() => void) | null>(null)
  const jobIdRef = useRef<string | null>(null)

  // When platform changes, also update the global orientation so the
  // export resolution matches what the user just picked.
  useEffect(() => {
    if (!open) return
    const preset = PLATFORM_PRESETS.find((p) => p.key === platform)
    if (preset && preset.orientation !== settings.orientation) {
      useBuilderStore.getState().updateSettings({ orientation: preset.orientation })
    }
  }, [platform, open, settings.orientation])

  const totalMs = useMemo(
    () => ayatList.reduce((s, a) => s + (a.audioDurationMs || 0), 0),
    [ayatList],
  )

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
  const startRender = async () => {
    if (!slides.length) return
    setStatus('processing')
    setProcessingPhase('composing')
    setProgress(0)
    setErrorMsg(null)
    setDownloadUrl(null)
    setIsMp4(true)

    // 1) hit POST /api/render (validates + HEAD-checks MP3s + creates job)
    // This is best-effort — if the API is rate-limited or unreachable,
    // we still proceed with the client-side render. The API is just for
    // job tracking, not for the actual rendering.
    let jobId: string | null = null
    let ownerToken: string | null = null
    try {
      const r = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides,
          reciterKey: reciter.audioKey,
          settings,
          orientation: settings.orientation,
        }),
      })
      if (r.ok) {
        const okBody = (await r.json()) as { jobId: string; ownerToken: string }
        jobId = okBody.jobId
        ownerToken = okBody.ownerToken
        jobIdRef.current = jobId
      }
      // If the API returns an error (e.g. rate limit 429), we don't throw —
      // we just skip the job tracking and proceed with the render.
    } catch {
      // Network error — proceed without job tracking.
    }

    // Helper: send a PUT update with the ownerToken. Best-effort — if the
    // server is unreachable the render still succeeds client-side.
    const sendUpdate = (payload: Record<string, unknown>) => {
      if (!jobId || !ownerToken) return
      fetch('/api/render', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-token': ownerToken,
        },
        body: JSON.stringify({ jobId, ...payload }),
      }).catch(() => {})
    }

    // 2) Client-side canvas + MediaRecorder render (produces WebM).
    //    Scaled to 0–60% of the unified progress bar.
    try {
      const { url: webmUrl, blob: webmBlob } = await renderVideoToWebm({
        canvas: canvasRef.current!,
        slides,
        settings,
        orientation: settings.orientation,
        quality,
        attributionLine: videoAttributionLine(translationKey),
        reciterName: reciter.name,
        onProgress: (p) => {
          // Scale 0–1 → 0–0.6
          const combined = p * 0.6
          setProgress(combined)
          sendUpdate({ progress: combined, status: 'processing' })
        },
      })

      setProgress(0.6)
      sendUpdate({ progress: 0.6, status: 'processing' })

      // 3) Convert WebM → MP4 server-side (Python + ffmpeg).
      //    Scaled to 60–100% of the unified progress bar.
      //    No status change — we stay in 'processing' the whole time so
      //    the user sees one continuous bar from 0% to 100%.
      setProcessingPhase('uploading')
      try {
        const mp4Blob = await webmToMp4(webmBlob, {
          onProgress: (p) => {
            // p is 0–1 within the conversion phase. Map to 0.6–1.0.
            // Also nudge the sub-phase label based on the conversion's
            // internal progress so the label reflects reality.
            if (p < 0.5) setProcessingPhase('uploading')
            else if (p < 0.95) setProcessingPhase('encoding')
            else setProcessingPhase('finalizing')
            const combined = 0.6 + p * 0.4
            setProgress(combined)
          },
        })

        URL.revokeObjectURL(webmUrl)

        const mp4Url = URL.createObjectURL(mp4Blob)
        setDownloadUrl(mp4Url)
        setIsMp4(true)
        setStatus('done')
        setProgress(1)
        sendUpdate({ status: 'done', progress: 1, downloadUrl: 'client' })
        toast.success('Video ready as MP4!')
      } catch (convErr) {
        // Conversion failed — fall back to the WebM URL so the user still
        // has a downloadable video. Mark it clearly as a fallback.
        console.warn('MP4 conversion failed, falling back to WebM', convErr)
        setDownloadUrl(webmUrl)
        setIsMp4(false)
        setStatus('done')
        setProgress(1)
        sendUpdate({ status: 'done', progress: 1, downloadUrl: 'client' })
        toast.error('MP4 conversion failed — downloaded as WebM instead. You can re-export to retry.')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Processing failed'
      setStatus('error')
      setErrorMsg(msg)
      toast.error(msg)
      sendUpdate({ status: 'error', error: msg })
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

        <canvas ref={canvasRef} className="hidden" />

        {/* Browser support warning — full width */}
        {!capabilities.ok && (
          <div className="mx-6 mb-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Browser not supported</p>
              <p className="text-xs leading-relaxed">{capabilities.reason}</p>
            </div>
          </div>
        )}

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
                <div className="grid grid-cols-2 gap-2">
                  {(['720p', '1080p'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={cn(
                        'rounded-xl border p-2.5 sm:p-3 text-sm font-medium transition',
                        quality === q
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
                      {RES[settings.orientation].w * (quality === '1080p' ? 1.5 : 1)} ×{' '}
                      {RES[settings.orientation].h * (quality === '1080p' ? 1.5 : 1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Format</span>
                    <span className="font-mono tabular-nums text-xs">
                      {isMp4 ? 'MP4' : 'WebM'}
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
                      to start.
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
                  downloadUrl={downloadUrl}
                  filename={filename}
                  isMp4={isMp4}
                  orientation={settings.orientation}
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
              disabled={!slides.length || !capabilities.ok}
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

// ---------------------------------------------------------------------
// Client-side canvas + MediaRecorder video renderer
// ---------------------------------------------------------------------

// Named constants — no magic numbers scattered through the render code.
const RENDER_FPS = 30
const RENDER_VIDEO_BITRATE = 6_000_000 // 6 Mbps — high quality for 720p/1080p
const RENDER_AUDIO_LEAD_MS = 100 // schedule audio 100ms ahead to avoid first-frame glitches
const RENDER_QUALITY_SCALE: Record<ExportOptions['quality'], number> = {
  '720p': 1,
  '1080p': 1.5,
}

interface RenderArgs {
  canvas: HTMLCanvasElement
  slides: AyatSlide[]
  settings: ReturnType<typeof useBuilderStore.getState>['settings']
  orientation: Orientation
  quality: ExportOptions['quality']
  /** Attribution line for the translation edition (empty for public-domain). */
  attributionLine: string
  /** Reciter name for the "Recited by" credit (always shown). */
  reciterName: string
  onProgress: (p: number) => void
}

async function renderVideoToWebm({
  canvas,
  slides,
  settings,
  orientation,
  quality,
  attributionLine,
  reciterName,
  onProgress,
}: RenderArgs): Promise<{ url: string; blob: Blob }> {
  const base = RES[orientation]
  const scale = RENDER_QUALITY_SCALE[quality]
  const W = Math.round(base.w * scale)
  const H = Math.round(base.h * scale)
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  // Load the background — for an MP4 video background we use a separate
  // <video> element that we'll seek frame-by-frame in the render loop;
  // for an image we use a regular <img>. Either way, `bgImg`/`bgVideo`
  // carries the loaded media (the other is null).
  const isVideoBg = settings.backgroundImage.endsWith('.mp4')
  const bgImg = isVideoBg
    ? null
    : await loadImage(settings.backgroundImage).catch(() => null)
  const bgVideo = isVideoBg
    ? await loadVideo(settings.backgroundImage).catch(() => null)
    : null

  // Load the watermark image once.
  const watermarkImg = await loadImage('/watermark.png').catch(() => null)

  // Pre-load all ayat audio as AudioBuffers via Web Audio API so we can
  // schedule them precisely on a single MediaRecorder timeline.
  // Safari < 14 ships AudioContext as webkitAudioContext. The capabilities
  // check at the top of the modal should prevent us reaching this code path
  // on a browser with neither variant, but we guard defensively anyway —
  // throwing a clear error is better than a non-null-assertion crash.
  type AudioContextCtor = typeof AudioContext
  const win = window as unknown as {
    AudioContext?: AudioContextCtor
    webkitAudioContext?: AudioContextCtor
  }
  const AudioCtx = win.AudioContext ?? win.webkitAudioContext
  if (!AudioCtx) {
    throw new Error(
      'Web Audio API is not available in this browser. Try Chrome, Edge, or Firefox on desktop.',
    )
  }
  const audioCtx = new AudioCtx()
  const buffers: AudioBuffer[] = []
  for (const s of slides) {
    const buf = await fetchAudioBuffer(s.audioUrl, audioCtx)
    buffers.push(buf)
  }
  const totalMs = slides.reduce(
    (sum, s, i) => sum + (buffers[i]?.duration ?? s.audioDurationMs / 1000) * 1000,
    0,
  )
  if (totalMs <= 0) {
    throw new Error('No audio could be loaded for the selected range.')
  }

  // Set up MediaRecorder on a canvas.captureStream() track.
  const stream = canvas.captureStream(RENDER_FPS)
  // Create a MediaStreamDestination to mix the audio into the recording.
  // Try to add audio tracks, but don't fail if it doesn't work.
  let dest: MediaStreamAudioDestinationNode | null = null
  try {
    dest = audioCtx.createMediaStreamDestination()
    for (const tr of dest.stream.getAudioTracks()) {
      stream.addTrack(tr)
    }
  } catch {
    // Audio mixing failed — record video only (silent video)
  }

  // Pick a supported MIME type. Uses the shared picker so the pre-flight
  // check and the actual render agree on what's supported.
  const mime = pickSupportedMimeType()
  const recorder = new MediaRecorder(
    stream,
    mime
      ? { mimeType: mime, videoBitsPerSecond: RENDER_VIDEO_BITRATE }
      : undefined,
  )

  const chunks: BlobPart[] = []
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve()
  })

  // Schedule all audio buffers back-to-back, starting a little ahead of "now"
  // so the first sample doesn't get clipped by the recorder's startup latency.
  const sources: AudioBufferSourceNode[] = []
  const leadSec = RENDER_AUDIO_LEAD_MS / 1000
  const startTime = audioCtx.currentTime + leadSec
  let t0 = startTime
  const startTimes: number[] = [] // audioCtx-time at which each ayat begins
  buffers.forEach((b) => {
    const src = audioCtx.createBufferSource()
    src.buffer = b
    if (dest) src.connect(dest)
    src.start(t0)
    startTimes.push(t0)
    sources.push(src)
    t0 += b.duration
  })
  const totalSec = t0 - startTime

  recorder.start() // collect all data at stop() — faster than timeslice

  // Drawing loop
  const startWall = performance.now()
  await new Promise<void>((resolve) => {
    const draw = () => {
      const elapsedSec = (performance.now() - startWall) / 1000
      // figure out which slide we're on
      let acc = 0
      let idx = 0
      let intoMs = 0
      for (let i = 0; i < slides.length; i++) {
        const dur = (buffers[i]?.duration ?? 0) * 1000
        if (elapsedSec * 1000 < acc + dur) {
          idx = i
          intoMs = elapsedSec * 1000 - acc
          break
        }
        acc += dur
        if (i === slides.length - 1) {
          idx = i
          intoMs = dur
        }
      }

      // ── Seek the background video to the current frame ───────────────
      // The video loops every `bgDurationSec` seconds. We seek to
      // `elapsedSec % bgDurationSec` so the background animation stays
      // in sync with the recitation timeline. Seeking is async, but
      // for short clips (<10s) the browser usually has the frame ready
      // by the next rAF tick; we draw whatever frame is currently
      // visible (which may be the previous frame for one tick).
      if (bgVideo) {
        const bgDur = bgVideo.duration
        if (Number.isFinite(bgDur) && bgDur > 0) {
          const targetT = elapsedSec % bgDur
          // Only seek if we're more than ~1 frame off — avoids excessive
          // re-seeking that can stall the video element.
          if (Math.abs(bgVideo.currentTime - targetT) > 1 / RENDER_FPS) {
            try { bgVideo.currentTime = targetT } catch { /* seeking can throw if not ready */ }
          }
        }
      }

      drawFrame({
        ctx,
        W,
        H,
        slide: slides[idx]!,
        intoMs,
        settings,
        bgImg,
        bgVideo,
        ayatIndex: idx,
        total: slides.length,
        attributionLine,
        reciterName,
        watermarkImg,
      })

      onProgress(Math.min(1, elapsedSec / totalSec))

      if (elapsedSec >= totalSec) {
        resolve()
        return
      }
      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)
  })

  // Stop everything
  sources.forEach((s) => {
    try { s.stop() } catch {}
  })
  recorder.stop()
  await stopped
  audioCtx.close()

  const blob = new Blob(chunks, { type: mime || 'video/webm' })
  const url = URL.createObjectURL(blob)
  return { url, blob }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Load a video file and wait until it has metadata + at least one frame
 * ready to draw. Used by the export pipeline to render MP4 video
 * backgrounds frame-by-frame onto the canvas. The video is muted and
 * paused — we drive it manually via `currentTime` seeking in the render
 * loop. `playsInline` is set so iOS Safari allows the metadata load
 * without a user gesture.
 */
function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video')
    v.src = src
    v.muted = true
    v.playsInline = true
    v.preload = 'auto'
    v.crossOrigin = 'anonymous'
    // Some browsers won't decode frames until the video starts playing
    // or at least has been "loadeddata". We wait for `loadeddata` (one
    // frame is available for drawing).
    v.onloadeddata = () => {
      // Try to start playback so the decoder actually decodes frames —
      // we immediately pause so there's no audible sound. This is the
      // most reliable cross-browser way to ensure `drawImage(video)`
      // produces a non-blank frame.
      v.play()
        .then(() => {
          v.pause()
          resolve(v)
        })
        .catch(() => {
          // Autoplay was blocked — fall back to a seeked-frame approach.
          // The video element should still be drawable after loadeddata
          // on most browsers (Chrome, Firefox, Safari desktop).
          resolve(v)
        })
    }
    v.onerror = () => reject(new Error(`Failed to load video: ${src}`))
    // Trigger the metadata load.
    v.load()
  })
}

async function fetchAudioBuffer(url: string, ctx: AudioContext): Promise<AudioBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch audio ${url}: ${res.status}`)
  const arr = await res.arrayBuffer()
  return await ctx.decodeAudioData(arr)
}

// ---------------------------------------------------------------------
// Per-frame drawing
// ---------------------------------------------------------------------

interface DrawArgs {
  ctx: CanvasRenderingContext2D
  W: number
  H: number
  slide: AyatSlide
  intoMs: number
  settings: RenderArgs['settings']
  bgImg: HTMLImageElement | null
  /** When the background is an MP4 video, this carries the loaded
   *  <video> element. The render loop seeks it to the correct frame
   *  before calling drawFrame; here we just `drawImage` its current
   *  frame onto the canvas (cover-fit, same as bgImg). */
  bgVideo: HTMLVideoElement | null
  ayatIndex: number
  total: number
  /** Attribution line for the translation edition (empty for public-domain). */
  attributionLine: string
  /** Reciter name for the "Recited by" credit (always shown). */
  reciterName: string
  /** Pre-loaded watermark image (transparent PNG). Null while loading or if
   *  the watermark file is missing — in that case we fall back to text. */
  watermarkImg: HTMLImageElement | null
}

function drawFrame({
  ctx,
  W,
  H,
  slide,
  intoMs,
  settings,
  bgImg,
  bgVideo,
  ayatIndex,
  total,
  attributionLine,
  reciterName,
  watermarkImg,
}: DrawArgs) {
  // ---- Background (cover-fit) -----------------------------------------
  // For image backgrounds: draw the loaded <img> cover-fit.
  // For video backgrounds: draw the current frame of the loaded <video>
  //   (the render loop has already seeked it to the right time).
  // Fallback: solid dark color if neither is available.
  if (bgImg) {
    const ratio = Math.max(W / bgImg.width, H / bgImg.height)
    const dw = bgImg.width * ratio
    const dh = bgImg.height * ratio
    ctx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh)
  } else if (bgVideo && bgVideo.videoWidth > 0) {
    // Cover-fit: scale so the video fills the canvas, cropping overflow.
    const vw = bgVideo.videoWidth
    const vh = bgVideo.videoHeight
    const ratio = Math.max(W / vw, H / vh)
    const dw = vw * ratio
    const dh = vh * ratio
    ctx.drawImage(bgVideo, (W - dw) / 2, (H - dh) / 2, dw, dh)
  } else {
    ctx.fillStyle = '#0a0f1a'
    ctx.fillRect(0, 0, W, H)
  }

  // ---- User overlay (using the selected preset shape) -----------------
  paintOverlayOnCanvas(ctx, W, H, settings)

  // ---- Subtle top + bottom gradient for legibility (always on) --------
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, 'rgba(0,0,0,0.22)')
  grad.addColorStop(0.18, 'rgba(0,0,0,0)')
  grad.addColorStop(0.78, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.30)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // ---- Top header: Arabic surah name + English + ayat indicator -------
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#ffffff'
  ctx.font = `${Math.round(H * 0.030)}px "Amiri Quran", "Amiri", serif`
  ctx.textAlign = 'left'
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = H * 0.008
  ctx.fillText(slide.surahNameArabic, W * 0.045, H * 0.045)
  ctx.shadowBlur = 0
  ctx.font = `${Math.round(H * 0.017)}px Inter, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText(
    slide.surahName.toUpperCase(),
    W * 0.045,
    H * 0.045 + H * 0.045,
  )

  ctx.textAlign = 'right'
  ctx.fillStyle = '#ffffff'
  ctx.font = `${Math.round(H * 0.026)}px "Amiri Quran", "Amiri", serif`
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = H * 0.008
  ctx.fillText(`${slide.surahNumber}:${slide.ayatNumber}`, W * 0.955, H * 0.045)
  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.font = `${Math.round(H * 0.013)}px Inter, sans-serif`
  ctx.fillText(
    `AYAT ${ayatIndex + 1} OF ${total}`.toUpperCase(),
    W * 0.955,
    H * 0.045 + H * 0.045,
  )

  // ---- Center content card --------------------------------------------
  // Map the arabicFont setting → CSS font-family string for canvas.
  // The fonts are loaded via next/font in layout.tsx and are available
  // to the canvas as long as they've been rendered at least once on the
  // page (which they have, since the CustomizationPanel previews them).
  const ARABIC_FONT_FAMILY: Record<string, string> = {
    uthmani: '"Amiri Quran", "Amiri", serif',
    amiri: '"Amiri Quran", "Amiri", serif',
    scheherazade: '"Scheherazade New", "Scheherazade", serif',
    naskh: '"Noto Naskh Arabic", "Noto Naskh", serif',
    kufi: '"Reem Kufi", "Reem", sans-serif',
    cairo: '"Cairo", sans-serif',
  }
  const arabicFontFamily =
    ARABIC_FONT_FAMILY[settings.arabicFont] ?? ARABIC_FONT_FAMILY.uthmani

  // Bengali font family — used when the translation is Bengali.
  const BENGALI_FONT_FAMILY: Record<string, string> = {
    sans: '"Noto Sans Bengali", "Noto Sans", sans-serif',
    serif: '"Noto Serif Bengali", "Noto Serif", serif',
    hind: '"Hind Siliguri", "Hind", sans-serif',
  }
  // Detect if the translation is Bengali by checking the translationKey
  // (passed via the attribution line helper, but we can also sniff the
  // slide's translation text for Bengali Unicode range). For canvas
  // rendering we use the bengaliFont setting only when the translation
  // contains Bengali characters.
  const isBengaliTranslation = /[\u0980-\u09FF]/.test(slide.translation)
  const bengaliFontFamily = isBengaliTranslation
    ? BENGALI_FONT_FAMILY[settings.bengaliFont] ?? BENGALI_FONT_FAMILY.sans
    : 'Inter, sans-serif'

  // Scale font by the SHORTER dimension (min of W, H) so text never
  // overflows on narrow portrait frames. Previously we scaled by H alone,
  // which made Arabic text enormous on portrait (H=1280 → 1.78x scale).
  // Using min(W,H) keeps the text proportional to the smaller dimension.
  const minDim = Math.min(W, H)
  const fontScale = minDim / 720
  // Boost font sizes: multiply by 1.4x so text is clearly readable on
  // mobile screens after Facebook/Instagram compression.
  const arabicFontSize = settings.arabicFontSize * fontScale * 1.4
  const transFontSize = settings.translationFontSize * fontScale * 1.4
  const translitFontSize = Math.max(11, minDim * 0.018 * 1.4)

  // Layout Arabic words centered, RTL, with line-wrapping.
  ctx.font = `${arabicFontSize}px ${arabicFontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const wordsArr = slide.arabicText.split(/\s+/)
  // Use a proportional space width — Arabic fonts often return a tiny
  // space width from measureText(' '). Use 0.3 * fontSize for a natural gap.
  const spaceW = arabicFontSize * 0.3
  // Text width: maps the user's textWidth setting to a fraction of W
  const TEXT_WIDTH_FRACTIONS: Record<string, number> = {
    full: 0.94,
    wide: 0.84,
    medium: 0.72,
    narrow: 0.60,
  }
  const innerMaxW = W * (TEXT_WIDTH_FRACTIONS[settings.textWidth] ?? 0.84)

  const arabicLineH = arabicFontSize * 1.8 // generous line height to prevent overlap

  // Wrap the Arabic words into visual lines (RTL centering happens at
  // draw time, not here — this just decides line breaks).
  const lines: string[][] = []
  {
    let ln: string[] = []
    let lnW = 0
    for (let i = 0; i < wordsArr.length; i++) {
      const w = wordsArr[i]!
      const ww = ctx.measureText(w).width
      if (lnW + ww > innerMaxW && ln.length) {
        lines.push(ln)
        ln = []
        lnW = 0
      }
      ln.push(w)
      lnW += ww + spaceW
    }
    if (ln.length) lines.push(ln)
  }
  const visibleArabicLines: string[][] = lines
  const arabicTotalH = visibleArabicLines.length * arabicLineH

  // Transliteration (one-line approximation)
  const translit = settings.showTransliteration ? slide.transliteration : ''
  const translitH = translit ? translitFontSize * 1.45 : 0

  // Translation wrapped — detect Bengali text and use the user-selected
  // Bengali font (sans/serif/hind). For non-Bengali translations, use Inter.
  const isBengali = /[\u0980-\u09FF]/.test(slide.translation)
  const transFontFamily = isBengali
    ? bengaliFontFamily
    : 'Inter, sans-serif'
  ctx.font = `${transFontSize}px ${transFontFamily}`

  let transLines: string[] = []
  if (settings.showTranslation && slide.translation) {
    transLines = wrapLines(ctx, slide.translation, innerMaxW)
  }
  const transLineH = transFontSize * 1.4
  const transTotalH = transLines.length * transLineH

  // Small divider (only when both translit and translation are shown)
  const dividerGap =
    translit && transLines.length ? Math.round(H * 0.015) + 1 : 0
  // Gap between Arabic and translation — controlled by textSpacing setting
  const TEXT_SPACING_FRACTIONS: Record<string, number> = {
    compact: 0.015,
    normal: 0.035,
    spacious: 0.060,
  }
  const arabicToTransGap = transLines.length
    ? Math.round(H * (TEXT_SPACING_FRACTIONS[settings.textSpacing] ?? 0.035))
    : 0
  const arabicToTranslitGap = translit ? Math.round(H * 0.020) : 0

  const cardPadX = Math.round(W * 0.05)
  const cardPadY = Math.round(H * 0.04)
  const cardW = innerMaxW + cardPadX * 2
  const cardContentH =
    arabicTotalH +
    arabicToTranslitGap +
    translitH +
    dividerGap +
    arabicToTransGap +
    transTotalH
  const cardH = cardContentH + cardPadY * 2
  const cardX = (W - cardW) / 2
  const cardY = (H - cardH) / 2

  // No card border / scrim — text floats directly on the background per the
  // spec ("do not need the card border"). The cardX/Y/W/H math is still used
  // to position the text block centered vertically.

  // Draw a dark rounded card behind the text — matches the reference design:
  // deep charcoal, ~60% opacity, large rounded corners, soft drop shadow.
  const bgPadX = Math.round(W * 0.06)
  const bgPadY = Math.round(H * 0.03)
  const bgX = cardX - bgPadX
  const bgY = cardY - bgPadY
  const bgW = cardW + bgPadX * 2
  const bgH = cardH + bgPadY * 2
  const bgRadius = Math.round(minDim * 0.04)

  // Soft drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = Math.round(minDim * 0.03)
  ctx.shadowOffsetY = Math.round(minDim * 0.005)

  // Dark card background — deep charcoal at ~60% opacity
  ctx.fillStyle = 'rgba(15, 15, 20, 0.6)'
  roundedRect(ctx, bgX, bgY, bgW, bgH, bgRadius)
  ctx.fill()

  // Reset shadow for text
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // Draw Arabic — plain word-by-word rendering with RTL centering.
  ctx.font = `${arabicFontSize}px ${arabicFontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let y = cardY + cardPadY + arabicLineH / 2

  for (const ln of visibleArabicLines) {
    const widths = ln.map((w) => ctx.measureText(w).width)
    const totalLineW = widths.reduce((a, b) => a + b, 0) + spaceW * (ln.length - 1)
    let xPos = W / 2 + totalLineW / 2
    for (let i = 0; i < ln.length; i++) {
      const w = ln[i]!
      const ww = widths[i]!
      xPos -= ww / 2
      ctx.fillStyle = settings.fontColor
      ctx.shadowColor = 'rgba(0,0,0,0.9)'
      ctx.shadowBlur = H * 0.012
      ctx.fillText(w, xPos, y)
      ctx.shadowBlur = 0
      xPos -= ww / 2 + spaceW
    }
    y += arabicLineH
  }

  // After Arabic loop, y is at the bottom of the last Arabic line.
  // Reset y to a clean position based on the card layout, not the loop variable.
  // This prevents overlap when the Arabic loop's y drifts.

  // Transliteration
  let yAfterArabic = cardY + cardPadY + arabicTotalH
  if (translit) {
    yAfterArabic += arabicToTranslitGap
    ctx.font = `italic ${translitFontSize}px Inter, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(translit, W / 2, yAfterArabic + translitFontSize / 2)
    yAfterArabic += translitH
  }

  // Divider
  if (dividerGap) {
    yAfterArabic += Math.round(H * 0.008)
    ctx.strokeStyle = hexWithAlpha(settings.fontColor, 0.4)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W / 2 - W * 0.03, yAfterArabic)
    ctx.lineTo(W / 2 + W * 0.03, yAfterArabic)
    ctx.stroke()
    yAfterArabic += Math.round(H * 0.008)
  }

  // Translation — use the clean yAfterArabic position, not the loop's y
  if (transLines.length) {
    if (!dividerGap) yAfterArabic += arabicToTransGap
    ctx.font = `${transFontSize}px ${transFontFamily}`
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.9)'
    ctx.shadowBlur = H * 0.008
    for (let i = 0; i < transLines.length; i++) {
      ctx.fillText(transLines[i]!, W / 2, yAfterArabic + transLineH / 2 + i * transLineH)
    }
    ctx.shadowBlur = 0
  }

  // ---- Attribution block (bottom-left) --------------------------------
  // Shows the translation attribution (when required) + the reciter credit
  // (always). Stacked vertically so both are visible.
  const attrFontSize = Math.round(H * 0.016)
  const attrLineH = attrFontSize * 1.35
  const attrBottom = H * 0.985
  const maxAttrW = W * 0.55

  // Helper: truncate text to fit within maxAttrW
  function truncateAttr(text: string): string {
    let t = text
    while (ctx.measureText(t).width > maxAttrW && t.length > 10) {
      t = t.slice(0, -2) + '…'
    }
    return t
  }

  ctx.font = `${attrFontSize}px Inter, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'

  // Draw reciter credit first (lower), then translation attribution (above it)
  if (reciterName) {
    ctx.fillText(`Recited by ${reciterName}`, W * 0.03, attrBottom)
  }
  if (attributionLine) {
    ctx.fillText(truncateAttr(attributionLine), W * 0.03, attrBottom - attrLineH)
  }

  // ---- Top-center watermark: Jariyah Now brand mark -------------------
  // Rendered at the TOP LEVEL of the composition (inside drawFrame, so it
  // appears on every frame, not tied to any single ayat's sequence).
  {
    const minDim = Math.min(W, H)
    const wmY = H * 0.04 // top: 4% from top edge

    if (watermarkImg && watermarkImg.complete && watermarkImg.naturalWidth > 0) {
      // Image watermark — scale to a target height proportional to the canvas size.
      // 112px @ 720p (clearly visible but not overpowering), scales to ~168px @ 1080p.
      const targetH = Math.round((minDim / 720) * 112)
      const scale = targetH / watermarkImg.naturalHeight
      const targetW = Math.round(watermarkImg.naturalWidth * scale)
      const x = Math.round((W - targetW) / 2) // horizontally centered

      ctx.save()
      ctx.globalAlpha = 0.9
      ctx.drawImage(watermarkImg, x, wmY, targetW, targetH)
      ctx.restore()
    } else {
      // Text fallback — used only if the watermark PNG hasn't loaded yet.
      const wmFontSize = Math.round((minDim / 720) * 14)
      ctx.save()
      ctx.font = `500 ${wmFontSize}px Inter, sans-serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = Math.max(1, Math.round(wmFontSize * 0.07))
      ctx.shadowBlur = Math.round(wmFontSize * 0.28)
      ctx.fillText('Made with Jariyah Now', W / 2, wmY)
      ctx.restore()
    }
  }
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function hexWithAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00'
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
