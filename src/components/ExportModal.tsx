'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Loader2, Film, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import { RECITERS as RECITERS_LIST } from '@/lib/reciters'
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
}[] = [
  { key: 'reel', label: 'Instagram Reel', hint: '1080×1920 · portrait', orientation: 'portrait' },
  { key: 'shorts', label: 'YouTube Shorts', hint: '1080×1920 · portrait', orientation: 'portrait' },
  { key: 'youtube', label: 'YouTube', hint: '1920×1080 · landscape', orientation: 'landscape' },
  { key: 'square', label: 'Square Post', hint: '1080×1080 · square', orientation: 'square' },
]

const RES: Record<Orientation, { w: number; h: number }> = {
  landscape: { w: 1280, h: 720 },
  portrait: { w: 720, h: 1280 },
  square: { w: 1080, h: 1080 },
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
        const j = await r.json().catch(() => ({}))
        throw new Error(j.error || `Render API returned ${r.status}`)
      }
      const j = await r.json()
      jobId = j.jobId
      jobIdRef.current = jobId
    } catch (e: any) {
      setStatus('error')
      setErrorMsg(e?.message || 'Failed to start render job')
      toast.error(e?.message || 'Failed to start render job')
      return
    }

    // 2) Client-side canvas + MediaRecorder render.
    try {
      const url = await renderVideoToWebm({
        canvas: canvasRef.current!,
        slides,
        settings,
        orientation: settings.orientation,
        quality,
        onProgress: (p) => {
          setProgress(p)
          // best-effort progress sync to the server
          if (jobId) {
            fetch('/api/render', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jobId, progress: p, status: 'rendering' }),
            }).catch(() => {})
          }
        },
      })

      setDownloadUrl(url)
      setStatus('done')
      setProgress(1)
      if (jobId) {
        fetch('/api/render', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId, status: 'done', progress: 1, downloadUrl: 'client' }),
        }).catch(() => {})
      }
      toast.success('Video rendered successfully!')
    } catch (e: any) {
      setStatus('error')
      setErrorMsg(e?.message || 'Render failed')
      toast.error(e?.message || 'Render failed')
      if (jobId) {
        fetch('/api/render', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId, status: 'error', error: String(e?.message || e) }),
        }).catch(() => {})
      }
    }
  }

  const estimatedDuration = formatMs(totalMs)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            Export video
          </DialogTitle>
          <DialogDescription>
            Pick a platform preset, choose quality, then render. The video is
            produced right in your browser via Canvas + MediaRecorder.
          </DialogDescription>
        </DialogHeader>

        <canvas ref={canvasRef} className="hidden" />

        <div className="space-y-5">
          {/* Platform presets */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Platform
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLATFORM_PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPlatform(p.key)}
                  className={cn(
                    'flex flex-col items-start gap-0.5 rounded-lg border border-border bg-background/40 p-3 text-left transition',
                    platform === p.key
                      ? 'border-primary bg-primary/10'
                      : 'hover:border-foreground/30',
                  )}
                >
                  <span className="text-sm font-medium">{p.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {p.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Quality
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(['720p', '1080p'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={cn(
                    'rounded-lg border border-border bg-background/40 p-3 text-sm transition',
                    quality === q
                      ? 'border-primary bg-primary/10'
                      : 'hover:border-foreground/30',
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border bg-background/40 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Filename</span>
              <span className="font-mono text-xs">{filename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated duration</span>
              <span className="font-mono">{estimatedDuration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ayats</span>
              <span>{slides.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resolution</span>
              <span className="font-mono">
                {RES[settings.orientation].w * (quality === '1080p' ? 1.5 : 1)} ×{' '}
                {RES[settings.orientation].h * (quality === '1080p' ? 1.5 : 1)}
              </span>
            </div>
          </div>

          {/* Progress */}
          {status === 'rendering' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Rendering… do not close this tab
                </span>
                <span className="font-mono">
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-background overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}

          {status === 'done' && downloadUrl && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Video ready!</span>
              </div>
              <video
                src={downloadUrl}
                controls
                className="w-full rounded-md max-h-64 bg-black"
              />
              <a
                href={downloadUrl}
                download={filename}
                className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
              >
                <Download className="h-4 w-4" />
                Download {filename}
              </a>
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Render failed</p>
                <p className="text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1.5" />
            Close
          </Button>
          {status !== 'rendering' && (
            <Button
              onClick={startRender}
              disabled={!slides.length}
            >
              <Film className="h-4 w-4 mr-1.5" />
              {status === 'done' ? 'Render again' : 'Render video'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------
// Client-side canvas + MediaRecorder video renderer
// ---------------------------------------------------------------------

interface RenderArgs {
  canvas: HTMLCanvasElement
  slides: AyatSlide[]
  settings: ReturnType<typeof useBuilderStore.getState>['settings']
  orientation: Orientation
  quality: ExportOptions['quality']
  onProgress: (p: number) => void
}

async function renderVideoToWebm({
  canvas,
  slides,
  settings,
  orientation,
  quality,
  onProgress,
}: RenderArgs): Promise<string> {
  const base = RES[orientation]
  const scale = quality === '1080p' ? 1.5 : 1
  const W = Math.round(base.w * scale)
  const H = Math.round(base.h * scale)
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Load the background image once
  const bgImg = await loadImage(settings.backgroundImage).catch(() => null)

  // Pre-load all ayat audio as AudioBuffers via Web Audio API so we can
  // schedule them precisely on a single MediaRecorder timeline.
  const AudioCtx: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext
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
  const fps = 30
  const stream = canvas.captureStream(fps)
  // Create a MediaStreamDestination to mix the audio into the recording.
  const dest = audioCtx.createMediaStreamDestination()
  for (const tr of dest.stream.getAudioTracks()) {
    stream.addTrack(tr)
  }

  // Pick a supported mime type. WebM/VP9 first, then VP8, then default.
  const mime = pickMime()
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 6_000_000 } : undefined)

  const chunks: BlobPart[] = []
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve()
  })

  // Schedule all audio buffers back-to-back starting at t=0
  const sources: AudioBufferSourceNode[] = []
  let t0 = audioCtx.currentTime + 0.1
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
  const totalSec = t0 - (audioCtx.currentTime + 0.1)

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

function pickMime(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ]
  for (const c of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) {
      return c
    }
  }
  return ''
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
}: DrawArgs) {
  // Background
  if (bgImg) {
    // cover-fit
    const ratio = Math.max(W / bgImg.width, H / bgImg.height)
    const dw = bgImg.width * ratio
    const dh = bgImg.height * ratio
    ctx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh)
  } else {
    ctx.fillStyle = '#0a0f1a'
    ctx.fillRect(0, 0, W, H)
  }

  // Overlay
  ctx.fillStyle = hexWithAlpha(settings.overlayColor, settings.overlayOpacity / 100)
  ctx.fillRect(0, 0, W, H)

  // Top header
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'top'
  // Arabic surah name
  ctx.font = `${Math.round(H * 0.03)}px var(--font-amiri), "Amiri Quran", serif`
  ctx.textAlign = 'left'
  ctx.fillText(slide.surahNameArabic, W * 0.04, H * 0.04)
  // English surah name
  ctx.font = `${Math.round(H * 0.018)}px Inter, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillText(slide.surahName.toUpperCase(), W * 0.04, H * 0.04 + H * 0.045)
  // Ayat indicator
  ctx.textAlign = 'right'
  ctx.fillStyle = '#ffffff'
  ctx.font = `${Math.round(H * 0.028)}px var(--font-amiri), "Amiri Quran", serif`
  ctx.fillText(`${slide.surahNumber}:${slide.ayatNumber}`, W * 0.96, H * 0.04)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = `${Math.round(H * 0.014)}px Inter, sans-serif`
  ctx.fillText(`AYAT ${ayatIndex + 1} OF ${total}`.toUpperCase(), W * 0.96, H * 0.04 + H * 0.045)

  // Text card border
  if (settings.showBorder) {
    ctx.strokeStyle = settings.borderColor
    ctx.lineWidth = Math.max(2, H * 0.003)
    const r = settings.border_radius * (H / 720)
    const mx = W * 0.07
    const my = H * 0.16
    const mw = W - mx * 2
    const mh = H - my * 2
    roundedRect(ctx, mx, my, mw, mh, r)
    ctx.stroke()
    // subtle inner fill
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    roundedRect(ctx, mx, my, mw, mh, r)
    ctx.fill()
  }

  // Arabic word-by-word
  const arabicFontFamily =
    settings.fontStyle === 'uthmani'
      ? 'var(--font-amiri), "Amiri Quran", serif'
      : 'var(--font-scheherazade), "Scheherazade New", serif'
  ctx.font = `${settings.arabicFontSize * (H / 720)}px ${arabicFontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Find the currently-active word
  let activeIdx = -1
  for (let i = 0; i < slide.words.length; i++) {
    const w = slide.words[i]!
    const end = w.endMs || (i + 1 < slide.words.length ? slide.words[i + 1]!.startMs : intoMs + 1)
    if (intoMs >= w.startMs && intoMs < end) {
      activeIdx = i
      break
    }
  }
  if (activeIdx < 0 && intoMs > 0 && slide.words.length) {
    activeIdx = slide.words.length - 1
  }

  // Layout words centered, RTL. We measure each word and lay them out
  // right-to-left across one or more lines as needed.
  const words = slide.words.length
    ? slide.words.map((w) => w.text)
    : slide.arabicText.split(/\s+/)
  const spaceW = ctx.measureText(' ').width
  const maxW = W * 0.8
  const lines: string[][] = []
  let line: string[] = []
  let lineW = 0
  for (let i = 0; i < words.length; i++) {
    const w = words[i]!
    const ww = ctx.measureText(w).width
    if (lineW + ww > maxW && line.length) {
      lines.push(line)
      line = []
      lineW = 0
    }
    line.push(w)
    lineW += ww + spaceW
  }
  if (line.length) lines.push(line)

  // Compute word index ranges per line so we know which word to highlight
  const lineHeight = settings.arabicFontSize * (H / 720) * 1.6
  const totalH = lines.length * lineHeight
  let y = H / 2 - totalH / 2 + lineHeight / 2
  let wordCounter = 0
  for (const ln of lines) {
    // Measure the whole line to center it
    const widths = ln.map((w) => ctx.measureText(w).width)
    const sum = widths.reduce((a, b) => a + b, 0) + spaceW * (ln.length - 1)
    let x = W / 2 + sum / 2 // start at the right edge (RTL)
    for (let i = 0; i < ln.length; i++) {
      const w = ln[i]!
      const ww = widths[i]!
      x -= ww
      const isHi = wordCounter === activeIdx
      ctx.fillStyle = isHi ? settings.highlightColor : settings.fontColor
      if (isHi) {
        ctx.shadowColor = settings.highlightColor
        ctx.shadowBlur = H * 0.025
      } else {
        ctx.shadowColor = 'rgba(0,0,0,0.6)'
        ctx.shadowBlur = H * 0.008
      }
      ctx.fillText(w, x, y)
      ctx.shadowBlur = 0
      x -= spaceW
      wordCounter++
    }
    y += lineHeight
  }

  // Transliteration
  if (settings.showTransliteration && slide.transliteration) {
    ctx.font = `italic ${Math.round(H * 0.02)}px Inter, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.textAlign = 'center'
    wrapText(ctx, slide.transliteration, W / 2, y + H * 0.02, W * 0.8, H * 0.03)
  }

  // Translation at the bottom
  if (settings.showTranslation) {
    ctx.font = `${settings.translationFontSize * (H / 720)}px Inter, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    wrapTextBottom(
      ctx,
      slide.translation,
      W / 2,
      H * 0.93,
      W * 0.84,
      settings.translationFontSize * (H / 720) * 1.35,
    )
  }

  // Watermark (kept here intentionally — matches preview; user can crop if needed)
  ctx.font = `${Math.round(H * 0.012)}px monospace`
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText('QuranVid', W * 0.97, H * 0.985)
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
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  maxW: number,
  lh: number,
) {
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
  lines.forEach((ln, i) => ctx.fillText(ln, cx, y + i * lh))
}

function wrapTextBottom(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  bottomY: number,
  maxW: number,
  lh: number,
) {
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
  const startY = bottomY - (lines.length - 1) * lh
  lines.forEach((ln, i) => ctx.fillText(ln, cx, startY + i * lh))
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00'
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
