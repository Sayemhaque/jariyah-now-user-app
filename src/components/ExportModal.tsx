'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Loader2, Film, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import { RECITERS as RECITERS_LIST } from '@/lib/reciters'
import { paintOverlayOnCanvas } from '@/lib/overlay'
import { getActiveWordIndex } from '@/lib/highlight'
import { videoAttributionLine } from '@/lib/translations'
import {
  checkExportCapabilities,
  pickSupportedMimeType,
} from '@/lib/exportCapabilities'
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

type RenderStatus = 'idle' | 'rendering' | 'done' | 'error'

interface ExportModalProps {
  open: boolean
  onOpenChange: (o: boolean) => void
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
    return `quran-${s}-ayat-${fromAyat}-${toAyat}-${reciter.id}.webm`
  }, [surah, fromAyat, toAyat, reciter.id])

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      if (stopRef.current) stopRef.current()
      setStatus('idle')
      setProgress(0)
      setDownloadUrl(null)
      setErrorMsg(null)
      jobIdRef.current = null
    }
  }, [open])

  // Build AyatSlide[] for the renderer
  const slides: AyatSlide[] = useMemo(
    () =>
      ayatList.map((a) => ({
        arabicText: a.arabicText,
        words: a.words.map((w) => ({
          text: w.text,
          startMs: w.startMs,
          endMs: w.endMs,
        })),
        translation: a.translation,
        transliteration: a.words.map((w) => w.transliteration || '').filter(Boolean).join(' '),
        surahName: surah?.name ?? '',
        surahNameArabic: surah?.arabicName ?? '',
        ayatNumber: a.ayatNumber,
        surahNumber: a.surahNumber,
        audioUrl: a.audioUrl,
        audioDurationMs: a.audioDurationMs,
      })),
    [ayatList, surah],
  )

  // ----------------- RENDER -----------------
  const startRender = async () => {
    if (!slides.length) return
    setStatus('rendering')
    setProgress(0)
    setErrorMsg(null)
    setDownloadUrl(null)

    // 1) hit POST /api/render (validates + HEAD-checks MP3s + creates job)
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
      if (!r.ok) {
        const errBody = (await r.json().catch(() => ({}))) as { error?: string }
        throw new Error(errBody.error || `Render API returned ${r.status}`)
      }
      const okBody = (await r.json()) as { jobId: string; ownerToken: string }
      jobId = okBody.jobId
      ownerToken = okBody.ownerToken
      jobIdRef.current = jobId
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start render job'
      setStatus('error')
      setErrorMsg(msg)
      toast.error(msg)
      return
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

    // 2) Client-side canvas + MediaRecorder render.
    try {
      const url = await renderVideoToWebm({
        canvas: canvasRef.current!,
        slides,
        settings,
        orientation: settings.orientation,
        quality,
        attributionLine: videoAttributionLine(translationKey),
        reciterName: reciter.name,
        onProgress: (p) => {
          setProgress(p)
          sendUpdate({ progress: p, status: 'rendering' })
        },
      })

      setDownloadUrl(url)
      setStatus('done')
      setProgress(1)
      sendUpdate({ status: 'done', progress: 1, downloadUrl: 'client' })
      toast.success('Video rendered successfully!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Render failed'
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
                    <span className="font-mono tabular-nums text-xs">WebM</span>
                  </div>
                </div>
              </div>

              {/* Format note */}
              <div className="rounded-lg border border-border bg-background/40 px-3 py-2.5 text-[11px] text-muted-foreground leading-relaxed">
                <span className="text-foreground/80 font-medium">Heads up:</span>{' '}
                WebM output. YouTube accepts it directly. Instagram needs MP4 —
                convert with{' '}
                <code className="bg-muted/40 px-1 py-0.5 rounded text-[10px]">
                  ffmpeg -i input.webm output.mp4
                </code>
                .
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
                    <p className="font-medium text-sm">Ready to render</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[240px]">
                      Pick your settings on the left, then hit{' '}
                      <span className="font-medium text-foreground">Render video</span>{' '}
                      to start.
                    </p>
                  </div>
                </div>
              )}

              {/* Rendering state */}
              {status === 'rendering' && (
                <div className="qv-card rounded-xl p-5 space-y-4 min-h-[280px] flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary/10 text-primary">
                      <Loader2 className="h-7 w-7 animate-spin" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Rendering your video…</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Do not close this tab
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-mono font-bold">{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-200 ease-out"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Done state — video preview + download */}
              {status === 'done' && downloadUrl && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-primary px-1">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Video ready!</span>
                  </div>
                  <video
                    src={downloadUrl}
                    controls
                    className="w-full rounded-xl bg-black aspect-video"
                  />
                  <a
                    href={downloadUrl}
                    download={filename}
                    className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl qv-btn-primary text-sm font-semibold"
                  >
                    <Download className="h-4 w-4" />
                    Download {filename}
                  </a>
                </div>
              )}

              {/* Error state */}
              {status === 'error' && (
                <div className="qv-card rounded-xl p-5 min-h-[280px] flex flex-col justify-center">
                  <div className="flex items-start gap-3 text-sm text-destructive">
                    <AlertCircle className="h-6 w-6 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-medium">Render failed</p>
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
          {status !== 'rendering' && (
            <Button
              onClick={startRender}
              disabled={!slides.length || !capabilities.ok}
              className="qv-btn-primary flex-1"
            >
              <Film className="h-4 w-4 mr-1.5" />
              {status === 'done' ? 'Render again' : 'Render video'}
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
}: RenderArgs): Promise<string> {
  const base = RES[orientation]
  const scale = RENDER_QUALITY_SCALE[quality]
  const W = Math.round(base.w * scale)
  const H = Math.round(base.h * scale)
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  // Load the background image once
  const bgImg = await loadImage(settings.backgroundImage).catch(() => null)

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
  const dest = audioCtx.createMediaStreamDestination()
  for (const tr of dest.stream.getAudioTracks()) {
    stream.addTrack(tr)
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
    src.connect(dest)
    src.start(t0)
    startTimes.push(t0)
    sources.push(src)
    t0 += b.duration
  })
  const totalSec = t0 - startTime

  recorder.start()

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

      drawFrame({
        ctx,
        W,
        H,
        slide: slides[idx]!,
        intoMs,
        settings,
        bgImg,
        ayatIndex: idx,
        total: slides.length,
        attributionLine,
        reciterName,
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
  return URL.createObjectURL(blob)
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
  ayatIndex: number
  total: number
  /** Attribution line for the translation edition (empty for public-domain). */
  attributionLine: string
  /** Reciter name for the "Recited by" credit (always shown). */
  reciterName: string
}

function drawFrame({
  ctx,
  W,
  H,
  slide,
  intoMs,
  settings,
  bgImg,
  ayatIndex,
  total,
  attributionLine,
  reciterName,
}: DrawArgs) {
  // ---- Background (cover-fit) -----------------------------------------
  if (bgImg) {
    const ratio = Math.max(W / bgImg.width, H / bgImg.height)
    const dw = bgImg.width * ratio
    const dh = bgImg.height * ratio
    ctx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh)
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
  // Find the currently-active word first so we can size the card to fit.
  const arabicFontFamily =
    settings.fontStyle === 'uthmani'
      ? '"Amiri Quran", "Amiri", serif'
      : '"Scheherazade New", "Scheherazade", serif'

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

  const activeIdx = getActiveWordIndex(slide.words, intoMs)

  // Layout Arabic words centered, RTL, with line-wrapping.
  ctx.font = `${arabicFontSize}px ${arabicFontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const wordsArr = slide.words.length
    ? slide.words.map((w) => w.text)
    : slide.arabicText.split(/\s+/)
  const spaceW = ctx.measureText(' ').width
  const innerMaxW = W * 0.84 // text area — wider so words don't wrap excessively
  const lines: string[][] = []
  let line: string[] = []
  let lineW = 0
  for (let i = 0; i < wordsArr.length; i++) {
    const w = wordsArr[i]!
    const ww = ctx.measureText(w).width
    if (lineW + ww > innerMaxW && line.length) {
      lines.push(line)
      line = []
      lineW = 0
    }
    line.push(w)
    lineW += ww + spaceW
  }
  if (line.length) lines.push(line)

  const arabicLineH = arabicFontSize * 1.8 // generous line height to prevent overlap
  const arabicTotalH = lines.length * arabicLineH

  // Transliteration (one-line approximation)
  const translit = settings.showTransliteration ? slide.transliteration : ''
  const translitH = translit ? translitFontSize * 1.45 : 0

  // Translation wrapped — detect Bengali text and use the Bengali font
  const isBengali = /[\u0980-\u09FF]/.test(slide.translation)
  const transFontFamily = isBengali
    ? '"Noto Sans Bengali", "Noto Sans", sans-serif'
    : 'Inter, sans-serif'
  let transLines: string[] = []
  if (settings.showTranslation) {
    ctx.font = `${transFontSize}px ${transFontFamily}`
    transLines = wrapLines(ctx, slide.translation, innerMaxW)
  }
  const transLineH = transFontSize * 1.4
  const transTotalH = transLines.length * transLineH

  // Small divider (only when both translit and translation are shown)
  const dividerGap =
    translit && transLines.length ? Math.round(H * 0.015) + 1 : 0
  // Large gap between Arabic and translation so they NEVER touch
  const arabicToTransGap = transLines.length
    ? Math.round(H * 0.035)
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

  // Draw a semi-transparent dark scrim behind the text area for contrast
  // against busy backgrounds. This makes the text readable on any image.
  const scrimPadX = Math.round(W * 0.06)
  const scrimPadY = Math.round(H * 0.025)
  const scrimX = cardX - scrimPadX
  const scrimY = cardY - scrimPadY
  const scrimW = cardW + scrimPadX * 2
  const scrimH = cardH + scrimPadY * 2
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  roundedRect(ctx, scrimX, scrimY, scrimW, scrimH, Math.round(H * 0.02))
  ctx.fill()

  // Draw Arabic word-by-word
  ctx.font = `${arabicFontSize}px ${arabicFontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let y = cardY + cardPadY + arabicLineH / 2
  let wordCounter = 0
  for (const ln of lines) {
    const widths = ln.map((w) => ctx.measureText(w).width)
    const sum = widths.reduce((a, b) => a + b, 0) + spaceW * (ln.length - 1)
    let x = W / 2 + sum / 2 // RTL: start at right edge
    for (let i = 0; i < ln.length; i++) {
      const w = ln[i]!
      const ww = widths[i]!
      x -= ww
      const isHi = wordCounter === activeIdx
      ctx.fillStyle = isHi ? settings.highlightColor : settings.fontColor
      if (isHi) {
        ctx.shadowColor = settings.highlightColor
        ctx.shadowBlur = H * 0.028
      } else {
        ctx.shadowColor = 'rgba(0,0,0,0.9)'
        ctx.shadowBlur = H * 0.012
      }
      ctx.fillText(w, x, y)
      ctx.shadowBlur = 0
      x -= spaceW
      wordCounter++
    }
    y += arabicLineH
  }

  // Transliteration
  if (translit) {
    y += arabicToTranslitGap - arabicLineH + translitFontSize * 0.7
    ctx.font = `italic ${translitFontSize}px Inter, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(translit, W / 2, y)
    y += translitFontSize * 0.75
  }

  // Divider
  if (dividerGap) {
    y += Math.round(H * 0.010)
    ctx.strokeStyle = hexWithAlpha(settings.fontColor, 0.4)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W / 2 - W * 0.03, y)
    ctx.lineTo(W / 2 + W * 0.03, y)
    ctx.stroke()
    y += Math.round(H * 0.010)
  }

  // Translation
  if (transLines.length) {
    if (!dividerGap) y += arabicToTransGap - (translit ? 0 : arabicLineH)
    else y += 0
    ctx.font = `${transFontSize}px ${transFontFamily}`
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.9)'
    ctx.shadowBlur = H * 0.008
    for (let i = 0; i < transLines.length; i++) {
      ctx.fillText(transLines[i]!, W / 2, y + i * transLineH)
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

  // ---- Watermark (bottom-right) --------------------------------------
  ctx.font = `${Math.round(H * 0.012)}px monospace`
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText('QuranVid', W * 0.97, H * 0.985)
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
