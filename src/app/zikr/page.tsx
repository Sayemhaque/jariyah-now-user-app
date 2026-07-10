'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Film,
  Menu,
  Eye,
  Settings as SettingsIcon,
  Loader2,
  Download,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react'
import {
  ZIKR_PRESETS,
  ZIKR_COUNT_PRESETS,
  getZikrById,
  estimateZikrDuration,
  getCounterStep,
  ZIKR_BACKGROUND_AUDIO,
  type ZikrPacing,
} from '@/lib/zikrPresets'
import { BG_PRESETS } from '@/components/CustomizationPanel'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { ArabicFont, OverlayStyle } from '@/lib/types'

// ─── Constants ──────────────────────────────────────────────────────────────

const ARABIC_FONT_CLASS: Record<string, string> = {
  uthmani: 'font-arabic-uthmani',
  amiri: 'font-arabic-uthmani',
  scheherazade: 'font-arabic-scheherazade',
  markazi: 'font-arabic-markazi',
  naskh: 'font-arabic-naskh',
  kufi: 'font-arabic-kufi',
  cairo: 'font-arabic-cairo',
}

// Map arabicFont → CSS font-family string for canvas export rendering.
const ARABIC_FONT_FAMILY: Record<string, string> = {
  uthmani: '"Amiri Quran", "Amiri", serif',
  amiri: '"Amiri Quran", "Amiri", serif',
  scheherazade: '"Scheherazade New", "Scheherazade", serif',
  markazi: '"Markazi Text", serif',
  naskh: '"Noto Naskh Arabic", "Noto Naskh", serif',
  kufi: '"Reem Kufi", "Reem", sans-serif',
  cairo: '"Cairo", sans-serif',
}

// Map overlayStyle → canvas-drawn background expression. Mirrors the
// CSS overlay shapes from lib/overlay.ts but inline for the zikr export.
function overlayToCanvasCss(s: ZikrSettings): string {
  const alpha = (s.overlayOpacity / 100).toFixed(3)
  const color = s.overlayStyle === 'none' ? 'transparent' : `rgba(0,0,0,${alpha})`
  switch (s.overlayStyle) {
    case 'none':
      return 'transparent'
    case 'solid':
      return color
    case 'bottom-gradient':
      return `linear-gradient(180deg, transparent 0%, rgba(0,0,0,${alpha}) 100%)`
    case 'top-gradient':
      return `linear-gradient(180deg, rgba(0,0,0,${alpha}) 0%, transparent 100%)`
    case 'vignette':
      return `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${alpha}) 100%)`
    case 'center-focus':
      return `radial-gradient(ellipse at center, rgba(0,0,0,${alpha}) 0%, transparent 70%)`
    default:
      return color
  }
}

// ─── Local Zikr settings (separate from the Quran builder's store) ──────────

interface ZikrSettings {
  zikrId: string
  count: number
  pacing: ZikrPacing
  backgroundImage: string
  backgroundPreset: string
  arabicFont: ArabicFont
  showTransliteration: boolean
  showMeaning: boolean
  fontColor: string
  highlightColor: string
  overlayStyle: OverlayStyle
  overlayOpacity: number
}

const DEFAULT_SETTINGS: ZikrSettings = {
  zikrId: 'subhanallah',
  count: 33,
  pacing: 'realtime',
  backgroundImage: '/backgrounds/twilight-mosque-portrait.png',
  backgroundPreset: 'twilight-mosque',
  arabicFont: 'uthmani',
  showTransliteration: true,
  showMeaning: true,
  fontColor: '#ffffff',
  highlightColor: '#f5b942',
  overlayStyle: 'bottom-gradient',
  overlayOpacity: 50,
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00'
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) || 0
  const g = parseInt(h.slice(2, 4), 16) || 0
  const b = parseInt(h.slice(4, 6), 16) || 0
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ─── Main page (wrapped in Suspense for useSearchParams) ────────────────────

export default function ZikrPageWrapper() {
  return (
    <Suspense fallback={<div className="h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>}>
      <ZikrPage />
    </Suspense>
  )
}

function ZikrPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ─── Settings state ──────────────────────────────────────────────────────
  const [settings, setSettings] = useState<ZikrSettings>(DEFAULT_SETTINGS)

  // Read URL params on mount — /zikr?zikr=subhanallah&count=99&pacing=realtime
  useEffect(() => {
    const zikrId = searchParams.get('zikr')
    const count = searchParams.get('count')
    const pacing = searchParams.get('pacing')
    setSettings((s) => ({
      ...s,
      zikrId: zikrId && getZikrById(zikrId) ? zikrId.toLowerCase() : s.zikrId,
      count: count ? Math.min(1000, Math.max(1, parseInt(count, 10) || s.count)) : s.count,
      pacing: pacing === 'realtime' || pacing === 'fast' || pacing === 'ultrafast' ? pacing : s.pacing,
    }))
  }, [searchParams])

  const zikr = useMemo(
    () => getZikrById(settings.zikrId) ?? ZIKR_PRESETS[0]!,
    [settings.zikrId],
  )

  // ─── Playback state ──────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentCount, setCurrentCount] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [volume, setVolume] = useState(0.9)
  const [muted, setMuted] = useState(false)

  // ─── Web Audio API refs ──────────────────────────────────────────────────
  const audioCtxRef = useRef<AudioContext | null>(null)
  const zikrBufferRef = useRef<AudioBuffer | null>(null)
  const zikrLoadedIdRef = useRef<string | null>(null)
  const bgBufferRef = useRef<AudioBuffer | null>(null)
  const zikrSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const bgSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const zikrGainRef = useRef<GainNode | null>(null)
  const bgGainRef = useRef<GainNode | null>(null)
  // Master gain — used for volume control
  const masterGainRef = useRef<GainNode | null>(null)

  // Timing refs (avoid re-renders inside the rAF loop)
  const startWallRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const stateRef = useRef({ settings, zikr })
  useEffect(() => {
    stateRef.current = { settings, zikr }
  }, [settings, zikr])

  const totalMs = useMemo(
    () => estimateZikrDuration(settings.count, settings.pacing),
    [settings.count, settings.pacing],
  )
  const stepMs = useMemo(
    () => getCounterStep(settings.pacing),
    [settings.pacing],
  )

  // ─── Load audio buffers when zikr changes ────────────────────────────────
  const loadBuffers = useCallback(async () => {
    if (!audioCtxRef.current) return
    const ctx = audioCtxRef.current

    // Load zikr clip if not already loaded for this zikr
    if (!zikrBufferRef.current || zikrLoadedIdRef.current !== zikr.id) {
      try {
        const res = await fetch(zikr.audioClip)
        if (!res.ok) throw new Error(`Failed to fetch ${zikr.audioClip}`)
        const arr = await res.arrayBuffer()
        const buf = await ctx.decodeAudioData(arr)
        zikrLoadedIdRef.current = zikr.id
        zikrBufferRef.current = buf
      } catch (err) {
        console.error('Failed to load zikr audio:', err)
        toast.error('Failed to load zikr audio clip')
      }
    }

    // Load background drone once
    if (!bgBufferRef.current) {
      try {
        const res = await fetch(ZIKR_BACKGROUND_AUDIO)
        if (!res.ok) throw new Error(`Failed to fetch ${ZIKR_BACKGROUND_AUDIO}`)
        const arr = await res.arrayBuffer()
        bgBufferRef.current = await ctx.decodeAudioData(arr)
      } catch (err) {
        console.error('Failed to load background audio:', err)
        // Non-fatal — silent background is OK
      }
    }
  }, [zikr])

  // ─── Initialize AudioContext on first user interaction ───────────────────
  const ensureAudioCtx = useCallback(async () => {
    if (!audioCtxRef.current) {
      type AudioContextCtor = typeof AudioContext
      const win = window as unknown as {
        AudioContext?: AudioContextCtor
        webkitAudioContext?: AudioContextCtor
      }
      const Ctor = win.AudioContext ?? win.webkitAudioContext
      if (!Ctor) {
        toast.error('Web Audio API not supported in this browser')
        return null
      }
      const ctx = new Ctor()
      audioCtxRef.current = ctx

      // Master gain → destination
      const master = ctx.createGain()
      master.gain.value = muted ? 0 : volume
      master.connect(ctx.destination)
      masterGainRef.current = master

      // Zikr gain → master
      const zikrGain = ctx.createGain()
      zikrGain.gain.value = 1.0
      zikrGain.connect(master)
      zikrGainRef.current = zikrGain

      // Background gain → master (low volume — atmosphere only)
      const bgGain = ctx.createGain()
      bgGain.gain.value = 0.25
      bgGain.connect(master)
      bgGainRef.current = bgGain
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume()
    }
    await loadBuffers()
    return audioCtxRef.current
  }, [volume, muted, loadBuffers])

  // ─── Schedule zikr + bg audio ────────────────────────────────────────────
  const schedulePlayback = useCallback(
    (startOffsetMs: number) => {
      const ctx = audioCtxRef.current
      if (!ctx) return
      const zikrBuf = zikrBufferRef.current
      const bgBuf = bgBufferRef.current
      const zikrGain = zikrGainRef.current
      const bgGain = bgGainRef.current
      if (!zikrGain || !bgGain) return

      // Stop any existing sources
      if (zikrSourceRef.current) {
        try { zikrSourceRef.current.stop() } catch {}
        zikrSourceRef.current = null
      }
      if (bgSourceRef.current) {
        try { bgSourceRef.current.stop() } catch {}
        bgSourceRef.current = null
      }

      // Compute elapsed time in seconds from the offset.
      const startSec = ctx.currentTime + 0.05 // small lead
      const leadInMs = 300
      const elapsedFromFirstUtterance = Math.max(0, startOffsetMs - leadInMs)

      // Schedule the zikr clip on each utterance boundary. Each utterance
      // starts at leadIn + i*stepMs and lasts `stepMs`. We schedule as many
      // as needed to fill from the current position to the end.
      // To avoid scheduling too many tiny sources, we schedule at most ~50
      // ahead and rely on the rAF loop to schedule more as time progresses.
      // For simplicity in this tool, we schedule ALL utterances up front —
      // even 500 utterances * (a 100KB buffer) is fine because Web Audio
      // reuses the same decoded buffer.
      const { count, pacing } = stateRef.current.settings
      const step = getCounterStep(pacing)
      const clipDur = zikrBuf?.duration ?? 2.5

      // Start scheduling from the next utterance boundary that hasn't
      // played yet (based on startOffsetMs).
      const startUtteranceIdx = Math.floor(elapsedFromFirstUtterance / step)
      for (let i = startUtteranceIdx; i < count; i++) {
        const utteranceStartMs = leadInMs + i * step
        const offsetFromNow = (utteranceStartMs - startOffsetMs) / 1000
        if (offsetFromNow < -0.05) continue // already passed
        const when = startSec + Math.max(0, offsetFromNow)
        if (zikrBuf && zikrGain) {
          const src = ctx.createBufferSource()
          src.buffer = zikrBuf
          // Play the clip, but cap at step duration so we don't overlap
          // the next utterance (for ultrafast pacing).
          src.connect(zikrGain)
          src.start(when, 0, Math.min(clipDur, step / 1000))
        }
      }

      // Background drone — loop continuously for the whole duration.
      if (bgBuf && bgGain) {
        const bgSrc = ctx.createBufferSource()
        bgSrc.buffer = bgBuf
        bgSrc.loop = true
        bgSrc.connect(bgGain)
        // Start at the right offset (so seeking works)
        const bgOffset = (startOffsetMs / 1000) % bgBuf.duration
        bgSrc.start(startSec, bgOffset)
        bgSourceRef.current = bgSrc
      }
    },
    [],
  )

  // ─── Playback controls ───────────────────────────────────────────────────
  const playFrom = useCallback(
    async (offsetMs: number) => {
      const ctx = await ensureAudioCtx()
      if (!ctx) return
      schedulePlayback(offsetMs)
      startWallRef.current = performance.now() - offsetMs
      setIsPlaying(true)

      // rAF loop — drives the counter + elapsed time UI
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      const tick = () => {
        const elapsed = performance.now() - startWallRef.current
        const total = estimateZikrDuration(
          stateRef.current.settings.count,
          stateRef.current.settings.pacing,
        )
        if (elapsed >= total) {
          setIsPlaying(false)
          setCurrentCount(stateRef.current.settings.count)
          setElapsedMs(total)
          // Stop background source
          if (bgSourceRef.current) {
            try { bgSourceRef.current.stop() } catch {}
            bgSourceRef.current = null
          }
          return
        }
        setElapsedMs(elapsed)
        // Compute current count from elapsed time:
        // count = floor((elapsed - leadIn) / step) + 1, clamped to [0, count]
        const step = getCounterStep(stateRef.current.settings.pacing)
        const leadIn = 300
        const c = Math.max(
          0,
          Math.min(
            stateRef.current.settings.count,
            Math.floor(Math.max(0, elapsed - leadIn) / step) + 1,
          ),
        )
        setCurrentCount(c)
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [ensureAudioCtx, schedulePlayback],
  )

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      // Pause — stop all sources, but remember position
      if (zikrSourceRef.current) {
        try { zikrSourceRef.current.stop() } catch {}
        // zikrSourceRef is per-utterance; we don't keep a ref to each.
        // Schedule a full stop by recreating audio graph on next play.
      }
      if (bgSourceRef.current) {
        try { bgSourceRef.current.stop() } catch {}
        bgSourceRef.current = null
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      // We need to stop ALL scheduled zikr sources. Since we can't, we
      // close + recreate the audio graph on next play.
      if (audioCtxRef.current) {
        // Disconnect zikrGain to mute any in-flight scheduled sources.
        // We'll reconnect on next play.
        if (zikrGainRef.current) {
          try { zikrGainRef.current.disconnect() } catch {}
        }
      }
      setIsPlaying(false)
    } else {
      // Resume from current elapsedMs
      // Reconnect zikrGain if it was disconnected
      if (audioCtxRef.current && zikrGainRef.current && masterGainRef.current) {
        try { zikrGainRef.current.connect(masterGainRef.current) } catch {}
      }
      await playFrom(elapsedMs >= totalMs ? 0 : elapsedMs)
    }
  }, [isPlaying, elapsedMs, totalMs, playFrom])

  const onSeek = useCallback(
    (vals: number[]) => {
      const target = vals[0] ?? 0
      // Stop everything
      if (zikrGainRef.current) {
        try { zikrGainRef.current.disconnect() } catch {}
      }
      if (bgSourceRef.current) {
        try { bgSourceRef.current.stop() } catch {}
        bgSourceRef.current = null
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current)

      setElapsedMs(target)
      const step = getCounterStep(stateRef.current.settings.pacing)
      const leadIn = 300
      const c = Math.max(
        0,
        Math.min(
          stateRef.current.settings.count,
          Math.floor(Math.max(0, target - leadIn) / step) + 1,
        ),
      )
      setCurrentCount(c)

      // If we're playing, restart from the new position
      if (isPlaying) {
        if (audioCtxRef.current && zikrGainRef.current && masterGainRef.current) {
          try { zikrGainRef.current.connect(masterGainRef.current) } catch {}
        }
        // Use Promise.resolve().then to avoid setState-in-callback warning
        Promise.resolve().then(() => playFrom(target))
      }
    },
    [isPlaying, playFrom],
  )

  // Update master gain when volume/mute changes
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        muted ? 0 : volume,
        audioCtxRef.current.currentTime,
      )
    }
  }, [volume, muted])

  // Reset when settings.count or settings.pacing change
  useEffect(() => {
     
    setIsPlaying(false)
     
    setCurrentCount(0)
     
    setElapsedMs(0)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (zikrGainRef.current) {
      try { zikrGainRef.current.disconnect() } catch {}
    }
    if (bgSourceRef.current) {
      try { bgSourceRef.current.stop() } catch {}
      bgSourceRef.current = null
    }
  }, [settings.count, settings.pacing, settings.zikrId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close() } catch {}
        audioCtxRef.current = null
      }
    }
  }, [])

  // ─── Settings update helpers ─────────────────────────────────────────────
  const update = useCallback((patch: Partial<ZikrSettings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  // ─── Export ──────────────────────────────────────────────────────────────
  const [exportOpen, setExportOpen] = useState(false)

  const onExport = useCallback(async () => {
    setExportOpen(true)
    setExportPhase('composing')
    setExportProgress(0)
    setExportUrl(null)
    setExportError(null)
    setIsMp4(false)

    try {
      const [
        { checkExportCapabilities, pickSupportedMimeType },
        { canConvertToMp4, webmToMp4 },
      ] = await Promise.all([
        import('@/lib/exportCapabilities'),
        import('@/lib/videoConverter'),
      ])

      const caps = checkExportCapabilities()
      if (!caps.ok) {
        throw new Error(caps.reason || 'Export not supported in this browser.')
      }

      const canvas = document.createElement('canvas')
      const W = 720
      const H = 1280
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!
      if (!ctx) throw new Error('Canvas 2D context unavailable')

      // Load background image
      const bgImg = await loadImage(settings.backgroundImage).catch(() => null)
      const watermarkImg = await loadImage('/watermark.png').catch(() => null)

      // Set up Web Audio for export (separate from playback ctx)
      type AudioContextCtor = typeof AudioContext
      const win = window as unknown as {
        AudioContext?: AudioContextCtor
        webkitAudioContext?: AudioContextCtor
      }
      const Ctor = win.AudioContext ?? win.webkitAudioContext
      if (!Ctor) throw new Error('Web Audio API not available')
      const expCtx = new Ctor()

      // Decode zikr + bg buffers
      let zikrBuf: AudioBuffer | null = null
      let bgBuf: AudioBuffer | null = null
      try {
        const zRes = await fetch(zikr.audioClip)
        if (zRes.ok) {
          const arr = await zRes.arrayBuffer()
          zikrBuf = await expCtx.decodeAudioData(arr)
        }
      } catch {}
      try {
        const bRes = await fetch(ZIKR_BACKGROUND_AUDIO)
        if (bRes.ok) {
          const arr = await bRes.arrayBuffer()
          bgBuf = await expCtx.decodeAudioData(arr)
        }
      } catch {}

      // MediaRecorder setup
      const stream = canvas.captureStream(24)
      let dest: MediaStreamAudioDestinationNode | null = null
      try {
        dest = expCtx.createMediaStreamDestination()
        for (const tr of dest.stream.getAudioTracks()) {
          stream.addTrack(tr)
        }
      } catch {}

      const mime = pickSupportedMimeType()
      const recorder = new MediaRecorder(
        stream,
        mime ? { mimeType: mime, videoBitsPerSecond: 4_000_000 } : undefined,
      )
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      const stopped = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve()
      })

      // Schedule audio
      const zikrGain = expCtx.createGain()
      zikrGain.gain.value = 1.0
      if (dest) zikrGain.connect(dest)
      const bgGain = expCtx.createGain()
      bgGain.gain.value = 0.25
      if (dest) bgGain.connect(dest)

      const totalExportMs = totalMs
      const stepExportMs = stepMs
      const leadInMs = 300
      const startTime = expCtx.currentTime + 0.1
      const clipDur = zikrBuf?.duration ?? 2.5

      // Schedule zikr utterances
      if (zikrBuf) {
        for (let i = 0; i < settings.count; i++) {
          const utteranceStartMs = leadInMs + i * stepExportMs
          const when = startTime + utteranceStartMs / 1000
          const src = expCtx.createBufferSource()
          src.buffer = zikrBuf
          src.connect(zikrGain)
          src.start(when, 0, Math.min(clipDur, stepExportMs / 1000))
        }
      }
      // Schedule bg drone
      if (bgBuf) {
        const bgSrc = expCtx.createBufferSource()
        bgSrc.buffer = bgBuf
        bgSrc.loop = true
        bgSrc.connect(bgGain)
        bgSrc.start(startTime)
      }

      recorder.start()
      const startWall = performance.now()

      // Render loop
      await new Promise<void>((resolve) => {
        const draw = () => {
          const elapsed = performance.now() - startWall
          drawZikrFrame({
            ctx,
            W,
            H,
            settings,
            zikr,
            elapsedMs: elapsed,
            totalMs: totalExportMs,
            stepMs: stepExportMs,
            count: settings.count,
            bgImg,
            watermarkImg,
          })
          setExportProgress(Math.min(0.6, (elapsed / totalExportMs) * 0.6))
          if (elapsed >= totalExportMs) {
            resolve()
            return
          }
          requestAnimationFrame(draw)
        }
        requestAnimationFrame(draw)
      })

      // Stop audio + recorder
      try { zikrGain.disconnect() } catch {}
      try { bgGain.disconnect() } catch {}
      if (bgBuf) {
        // bg source will auto-stop when ctx closes
      }
      recorder.stop()
      await stopped
      try { expCtx.close() } catch {}

      setExportPhase('uploading')
      const webmBlob = new Blob(chunks, { type: mime || 'video/webm' })
      const webmUrl = URL.createObjectURL(webmBlob)

      // Try MP4 conversion via /api/convert-mp4
      const wantMp4 = await canConvertToMp4()
      let finalUrl = webmUrl
      let finalBlob = webmBlob
      let mp4 = false
      if (wantMp4) {
        setExportPhase('encoding')
        try {
          const mp4Blob = await webmToMp4(webmBlob)
          if (mp4Blob) {
            finalUrl = URL.createObjectURL(mp4Blob)
            finalBlob = mp4Blob
            mp4 = true
          }
        } catch (err) {
          console.warn('MP4 conversion failed, falling back to WebM:', err)
        }
      }

      setExportPhase('finalizing')
      setExportProgress(1)
      setExportUrl(finalUrl)
      setExportBlob(finalBlob)
      setIsMp4(mp4)
       
      Promise.resolve().then(() => setExportPhase('done'))
    } catch (err) {
      console.error('Export failed:', err)
      setExportError(err instanceof Error ? err.message : 'Export failed')
      setExportPhase('error')
    }
  }, [settings, zikr, totalMs, stepMs])

  // ─── Export state ────────────────────────────────────────────────────────
  const [exportPhase, setExportPhase] = useState<
    'composing' | 'uploading' | 'encoding' | 'finalizing' | 'done' | 'error'
  >('composing')
  const [exportProgress, setExportProgress] = useState(0)
  const [exportUrl, setExportUrl] = useState<string | null>(null)
  const [exportBlob, setExportBlob] = useState<Blob | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isMp4, setIsMp4] = useState(false)

  // ─── UI state ────────────────────────────────────────────────────────────
  const [mobileTab, setMobileTab] = useState<'preview' | 'settings'>('settings')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeExport = useCallback(() => {
    setExportOpen(false)
    if (exportUrl) URL.revokeObjectURL(exportUrl)
    setExportUrl(null)
    setExportBlob(null)
    setExportProgress(0)
    setExportPhase('composing')
    setExportError(null)
  }, [exportUrl])

  // ─── Derived values for render ───────────────────────────────────────────
  const progress = totalMs > 0 ? Math.min(1, elapsedMs / totalMs) : 0
  const ringRadius = 130
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference * (1 - progress)

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border qv-frosted shrink-0 z-30">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <NextImage
              src="/logo.png"
              alt="Jariyah Now logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl object-contain"
            />
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold tracking-tight">Jariyah Now</span>
              <span className="text-[11px] text-muted-foreground font-medium">Zikr Reels</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              Quran Reels
            </Link>
            <Link
              href="/templates"
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              Templates
            </Link>
            <Button
              onClick={() => setExportOpen(true)}
              size="sm"
              className="qv-btn-primary font-semibold"
            >
              <Film className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Export video</span>
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  <Link href="/app" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium">Quran Reels</Link>
                  <Link href="/templates" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium">Templates</Link>
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium">About</Link>
                  <Link href="/terms" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium">Terms</Link>
                  <Link href="/privacy" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium">Privacy</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Mobile tab bar */}
      <div className="lg:hidden flex border-b border-border bg-card shrink-0">
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition ${mobileTab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          <Eye className="h-4 w-4" /> Preview
        </button>
        <button
          onClick={() => setMobileTab('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition ${mobileTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          <SettingsIcon className="h-4 w-4" /> Settings
        </button>
      </div>

      {/* Main layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-0 min-h-0 overflow-hidden">
        {/* Preview pane */}
        <section
          className={`relative bg-muted/30 flex flex-col min-h-0 overflow-hidden ${mobileTab === 'preview' ? 'flex-1' : 'hidden lg:flex'}`}
        >
          {/* Preview frame — phone mockup style */}
          <div className="flex-1 min-h-0 grid place-items-center p-3 sm:p-6">
            <div
              className="qv-smooth relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
              style={{
                aspectRatio: '9 / 16',
                height: '100%',
                width: 'auto',
                maxWidth: '100%',
                containerType: 'inline-size',
                backgroundImage: `url(${settings.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: overlayToCanvasCss(settings) }}
              />
              {/* Top + bottom gradient for legibility */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.30) 100%)',
                }}
              />

              {/* Top header — zikr transliteration + meaning */}
              <div
                className="absolute top-0 inset-x-0 flex flex-col items-center text-white"
                style={{ padding: '5cqw 5cqw 0' }}
              >
                <span
                  className="uppercase tracking-[0.18em] opacity-65"
                  style={{ fontSize: '2cqw' }}
                >
                  Zikr Counter
                </span>
                <span
                  className="text-white/85 mt-1 text-center"
                  style={{ fontSize: '3cqw', fontWeight: 500 }}
                >
                  {zikr.transliteration} · {zikr.meaning}
                </span>
              </div>

              {/* Center content — progress ring + counter + Arabic */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ padding: '0 8cqw' }}
              >
                {/* Progress ring + counter */}
                <div
                  className="relative grid place-items-center"
                  style={{
                    width: '50cqw',
                    height: '50cqw',
                    maxWidth: '320px',
                    maxHeight: '320px',
                  }}
                >
                  <svg
                    viewBox="0 0 300 300"
                    className="absolute inset-0 w-full h-full -rotate-90"
                  >
                    {/* Background ring */}
                    <circle
                      cx="150"
                      cy="150"
                      r={ringRadius}
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="6"
                    />
                    {/* Progress ring */}
                    <circle
                      cx="150"
                      cy="150"
                      r={ringRadius}
                      fill="none"
                      stroke={settings.highlightColor}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      style={{
                        transition: 'stroke-dashoffset 120ms ease-out',
                        filter: `drop-shadow(0 0 8px ${hexToRgba(settings.highlightColor, 0.6)})`,
                      }}
                    />
                  </svg>
                  {/* Counter text inside the ring */}
                  <div className="relative flex flex-col items-center text-center">
                    <span
                      className="font-mono font-bold tabular-nums text-white drop-shadow-lg"
                      style={{
                        fontSize: '18cqw',
                        lineHeight: 1,
                        textShadow: '0 4px 24px rgba(0,0,0,0.5)',
                      }}
                    >
                      {currentCount}
                    </span>
                    <span
                      className="text-white/60 mt-1"
                      style={{ fontSize: '4cqw' }}
                    >
                      / {settings.count}
                    </span>
                  </div>
                </div>

                {/* Arabic zikr text */}
                <div
                  dir="rtl"
                  lang="ar"
                  className={cn(
                    'text-center mt-4 leading-[1.5] drop-shadow-lg',
                    ARABIC_FONT_CLASS[settings.arabicFont] ?? 'font-arabic-uthmani',
                  )}
                  style={{
                    color: settings.fontColor,
                    fontSize: '8cqw',
                  }}
                >
                  {zikr.arabic}
                </div>

                {/* Transliteration */}
                {settings.showTransliteration && (
                  <div
                    className="text-center italic text-white/70 mt-2"
                    style={{ fontSize: '3cqw', maxWidth: '70cqw' }}
                  >
                    {zikr.transliteration}
                  </div>
                )}

                {/* Meaning */}
                {settings.showMeaning && (
                  <div
                    className="text-center text-white/85 mt-1"
                    style={{ fontSize: '2.8cqw', maxWidth: '70cqw' }}
                  >
                    {zikr.meaning}
                  </div>
                )}
              </div>

              {/* Top-center play/pause overlay (only when paused) */}
              {!isPlaying && elapsedMs < totalMs && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 grid place-items-center bg-black/30 transition"
                  aria-label="Play"
                >
                  <div className="grid place-items-center h-16 w-16 rounded-full bg-primary/90 text-primary-foreground shadow-lg">
                    <Play className="h-8 w-8 translate-x-0.5" />
                  </div>
                </button>
              )}

              {/* Watermark */}
              <NextImage
                src="/watermark.png"
                alt=""
                aria-hidden
                width={120}
                height={34}
                sizes="6cqw"
                className="absolute pointer-events-none select-none h-[6cqw] w-auto"
                style={{
                  top: '4cqw',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  opacity: 0.85,
                  filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))',
                }}
              />
            </div>
          </div>

          {/* Controls bar — like the Quran app */}
          <div className="border-t border-border bg-card px-3 sm:px-5 py-2.5 sm:py-3 space-y-2 shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg hover:bg-muted"
                  onClick={() => onSeek([0])}
                  title="Restart"
                  aria-label="Restart"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  className="h-11 w-11 rounded-full qv-btn-primary"
                  onClick={togglePlay}
                  title={isPlaying ? 'Pause' : 'Play'}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 translate-x-0.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg hover:bg-muted"
                  onClick={() => onSeek([totalMs])}
                  title="Skip to end"
                  aria-label="Skip to end"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Seek bar */}
              <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
                <Slider
                  value={[Math.min(totalMs, elapsedMs)]}
                  max={Math.max(1, totalMs)}
                  step={100}
                  onValueChange={onSeek}
                  className="flex-1 min-w-0"
                />
                <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap tabular-nums shrink-0">
                  {formatMs(elapsedMs)} / {formatMs(totalMs)}
                </span>
              </div>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg hover:bg-muted"
                  onClick={() => setMuted((m) => !m)}
                  title={muted ? 'Unmute' : 'Mute'}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[muted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(v) => {
                    setVolume(v[0]! / 100)
                    setMuted(false)
                  }}
                  className="w-20"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden h-9 w-9 rounded-lg hover:bg-muted shrink-0"
                onClick={() => setMuted((m) => !m)}
                title={muted ? 'Unmute' : 'Mute'}
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Status line */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-foreground/80 truncate">
                  {zikr.transliteration}
                </span>
                <span className="opacity-50 shrink-0">·</span>
                <span className="tabular-nums shrink-0">
                  Count {settings.count} · {settings.pacing}
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-foreground/70 shrink-0">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary qv-pulse" />
                <span className="uppercase tracking-[0.15em] text-[10px]">
                  Live preview
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Settings sidebar */}
        <aside
          className={`border-t lg:border-t-0 lg:border-l border-border bg-card min-h-0 overflow-y-auto scrollbar-thin ${mobileTab === 'settings' ? 'flex-1' : 'hidden lg:block'}`}
        >
          <div className="p-3 sm:p-4 space-y-4">
            {/* Selection */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="qv-step">1</span>
                <h2 className="text-sm font-bold tracking-tight">Zikr</h2>
              </div>

              {/* Zikr selector */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Phrase</Label>
                <Select
                  value={settings.zikrId}
                  onValueChange={(v) => update({ zikrId: v })}
                >
                  <SelectTrigger className="h-10 bg-background/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ZIKR_PRESETS.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        <span className="font-arabic-uthmani text-base mr-2">{z.arabic}</span>
                        <span className="text-muted-foreground text-xs">— {z.transliteration}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Count presets */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Repetitions</Label>
                <div className="grid grid-cols-4 gap-2">
                  {ZIKR_COUNT_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => update({ count: c })}
                      className={cn(
                        'rounded-lg border py-2 text-sm font-semibold transition tabular-nums',
                        settings.count === c
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card hover:border-foreground/30',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {/* Custom count */}
                <div className="mt-2 flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Custom:</Label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={settings.count}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10)
                      if (!Number.isNaN(n) && n >= 1 && n <= 1000) {
                        update({ count: n })
                      }
                    }}
                    className="h-8 w-20 px-2 rounded-md border border-border bg-background/60 text-sm tabular-nums"
                  />
                  <span className="text-[11px] text-muted-foreground">max 1000</span>
                </div>
              </div>

              {/* Pacing */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Pacing</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['realtime', 'fast', 'ultrafast'] as ZikrPacing[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => update({ pacing: p })}
                      className={cn(
                        'rounded-lg border py-2 text-[11px] font-semibold capitalize transition',
                        settings.pacing === p
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card hover:border-foreground/30',
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Total duration: <span className="font-mono">{formatMs(totalMs)}</span>
                </p>
              </div>
            </section>

            <div className="h-px bg-border" />

            {/* Customize */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="qv-step">2</span>
                <h2 className="text-sm font-bold tracking-tight">Customize</h2>
              </div>

              {/* Background */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Background</Label>
                <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                  {BG_PRESETS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => update({
                        backgroundImage: p.url,
                        backgroundPreset: p.key,
                      })}
                      className={cn(
                        'group relative aspect-video rounded-lg overflow-hidden border transition',
                        settings.backgroundPreset === p.key
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background border-transparent'
                          : 'border-border hover:border-foreground/40',
                      )}
                    >
                      {p.isVideo ? (
                        <video
                          src={p.url}
                          className="absolute inset-0 h-full w-full object-cover"
                          muted
                          loop
                          autoPlay
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <NextImage
                          src={p.url}
                          alt={p.label}
                          fill
                          sizes="(max-width: 768px) 33vw, 200px"
                          className="object-cover"
                        />
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[9px] font-medium py-0.5 px-1 text-center truncate">
                        {p.emoji ? `${p.emoji} ` : ''}{p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Arabic font */}
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Arabic font</Label>
                <Select
                  value={settings.arabicFont}
                  onValueChange={(v: ArabicFont) => update({ arabicFont: v })}
                >
                  <SelectTrigger className="h-8 w-[180px] bg-background/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uthmani">
                      <span className="font-arabic-uthmani">سبحان — Amiri</span>
                    </SelectItem>
                    <SelectItem value="scheherazade">
                      <span className="font-arabic-scheherazade">سبحان — Scheherazade</span>
                    </SelectItem>
                    <SelectItem value="markazi">
                      <span className="font-arabic-markazi">سبحان — Markazi</span>
                    </SelectItem>
                    <SelectItem value="naskh">
                      <span className="font-arabic-naskh">سبحان — Noto Naskh</span>
                    </SelectItem>
                    <SelectItem value="kufi">
                      <span className="font-arabic-kufi">سبحان — Reem Kufi</span>
                    </SelectItem>
                    <SelectItem value="cairo">
                      <span className="font-arabic-cairo">سبحان — Cairo</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show transliteration</Label>
                <Switch
                  checked={settings.showTransliteration}
                  onCheckedChange={(v) => update({ showTransliteration: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show meaning</Label>
                <Switch
                  checked={settings.showMeaning}
                  onCheckedChange={(v) => update({ showMeaning: v })}
                />
              </div>

              {/* Highlight color (used for the ring) */}
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Ring color</Label>
                <input
                  type="color"
                  value={settings.highlightColor}
                  onChange={(e) => update({ highlightColor: e.target.value })}
                  className="h-7 w-12 rounded-md border border-border cursor-pointer"
                />
              </div>

              {/* Overlay */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Overlay</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['none', 'bottom-gradient', 'vignette', 'solid', 'top-gradient', 'center-focus'] as OverlayStyle[]).map((o) => (
                    <button
                      key={o}
                      onClick={() => update({ overlayStyle: o })}
                      className={cn(
                        'rounded-lg border py-1.5 text-[10px] font-medium transition capitalize',
                        settings.overlayStyle === o
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card hover:border-foreground/30',
                      )}
                    >
                      {o.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="h-px bg-border" />

            {/* Export */}
            <section className="space-y-3">
              <Button
                onClick={() => setExportOpen(true)}
                className="w-full qv-btn-primary font-semibold"
                size="default"
              >
                <Film className="h-4 w-4 mr-1.5" />
                Export video
              </Button>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Exports a 9:16 portrait MP4 (H.264 + AAC) ready for Instagram
                Reels, TikTok, and YouTube Shorts. The audio is the looped
                zikr clip + an ambient drone bed.
              </p>
            </section>

            {/* Footer */}
            <div className="pt-1 pb-2 text-[11px] text-muted-foreground space-y-2">
              <p className="leading-relaxed">
                Audio synthesized via espeak-ng (Arabic voice) + ffmpeg pitch
                shift. Background drone generated via numpy.
              </p>
              <nav className="flex items-center gap-3">
                <Link href="/app" className="hover:text-foreground transition">Quran Reels</Link>
                <span className="opacity-40">·</span>
                <Link href="/templates" className="hover:text-foreground transition">Templates</Link>
                <span className="opacity-40">·</span>
                <Link href="/about" className="hover:text-foreground transition">About</Link>
              </nav>
            </div>
          </div>
        </aside>
      </main>

      {/* Export modal */}
      <ZikrExportModal
        open={exportOpen}
        onOpenChange={(o) => { if (!o) closeExport() }}
        onExport={onExport}
        phase={exportPhase}
        progress={exportProgress}
        url={exportUrl}
        blob={exportBlob}
        error={exportError}
        isMp4={isMp4}
        zikrName={zikr.transliteration}
        count={settings.count}
      />
    </div>
  )
}

// ─── Zikr Export Modal ──────────────────────────────────────────────────────

interface ZikrExportModalProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  onExport: () => Promise<void>
  phase: 'composing' | 'uploading' | 'encoding' | 'finalizing' | 'done' | 'error'
  progress: number
  url: string | null
  blob: Blob | null
  error: string | null
  isMp4: boolean
  zikrName: string
  count: number
}

function ZikrExportModal({
  open,
  onOpenChange,
  onExport,
  phase,
  progress,
  url,
  blob,
  error,
  isMp4,
  zikrName,
  count,
}: ZikrExportModalProps) {
  // Auto-start export when opened
  useEffect(() => {
    if (open && phase === 'composing' && progress === 0 && !url && !error) {
      onExport()
    }
  }, [open, phase, progress, url, error, onExport])  

  const pct = Math.min(100, Math.max(0, Math.round(progress * 100)))

  const filename = `${zikrName.toLowerCase().replace(/\s+/g, '-')}-${count}-${isMp4 ? 'mp4' : 'webm'}.${isMp4 ? 'mp4' : 'webm'}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            Export Zikr video
          </DialogTitle>
          <DialogDescription>
            {zikrName} × {count} — 9:16 portrait, ~30s
          </DialogDescription>
        </DialogHeader>

        {phase !== 'done' && phase !== 'error' && (
          <div className="qv-processing-panel relative rounded-2xl border border-primary/20 overflow-hidden min-h-[280px] flex flex-col justify-center p-6">
            <div
              aria-hidden
              className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
            />

            <div className="relative mx-auto mb-6">
              <div
                aria-hidden
                className="qv-processing-glow absolute inset-0 rounded-full bg-primary/30 blur-xl"
              />
              <div className="qv-processing-ring absolute inset-0 rounded-full" />
              <div className="relative grid place-items-center h-20 w-20 rounded-full bg-card shadow-lg">
                <NextImage src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
              </div>
            </div>

            <div className="text-center mb-5 min-h-[44px]">
              <p className="font-semibold text-base text-foreground">
                {phase === 'composing' && 'Composing frames'}
                {phase === 'uploading' && 'Preparing for conversion'}
                {phase === 'encoding' && 'Encoding to MP4'}
                {phase === 'finalizing' && 'Finalizing'}
                <span className="inline-flex ml-1.5 align-middle">
                  <span className="qv-dot inline-block h-1.5 w-1.5 rounded-full bg-primary mx-0.5" />
                  <span className="qv-dot inline-block h-1.5 w-1.5 rounded-full bg-primary mx-0.5" />
                  <span className="qv-dot inline-block h-1.5 w-1.5 rounded-full bg-primary mx-0.5" />
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {phase === 'composing' && 'Rendering the canvas, frame by frame'}
                {phase === 'uploading' && 'Sending to the Python + ffmpeg encoder'}
                {phase === 'encoding' && 'H.264 + AAC, optimized for every platform'}
                {phase === 'finalizing' && 'Almost done — preparing your download'}
              </p>
            </div>

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
              <div className="relative h-2.5 rounded-full bg-muted/80 overflow-hidden ring-1 ring-inset ring-border">
                <div
                  className="qv-processing-bar relative h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-[width] duration-300 ease-out"
                  style={{ width: `${pct}%` }}
                >
                  <div
                    aria-hidden
                    className="qv-processing-shimmer absolute inset-0 rounded-full"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center pt-1">
                Do not close this tab while processing
              </p>
            </div>
          </div>
        )}

        {phase === 'done' && url && (
          <div className="qv-processing-panel relative rounded-2xl border border-primary/20 overflow-hidden p-6 sm:p-8 text-center">
            <div
              aria-hidden
              className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative">
              <div className="grid place-items-center h-16 w-16 rounded-full bg-emerald-500/15 text-emerald-500 mx-auto mb-4">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h3 className="text-lg font-bold mb-1">Video ready!</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Your video has been processed as{' '}
                {isMp4 ? 'MP4 · Portrait 9:16' : 'WebM · Portrait 9:16'}
              </p>
              <a
                href={url}
                download={filename}
                className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl qv-btn-primary text-sm font-semibold"
              >
                <Download className="h-4 w-4" />
                Download {filename}
              </a>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                {isMp4 ? 'MP4 · H.264' : 'WebM fallback'}
              </div>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <div className="grid place-items-center h-12 w-12 rounded-full bg-destructive/15 text-destructive mx-auto mb-3">
              <X className="h-6 w-6" />
            </div>
            <h3 className="font-bold mb-1">Processing failed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error ?? 'Unknown error'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Canvas frame drawing for export ────────────────────────────────────────

interface DrawArgs {
  ctx: CanvasRenderingContext2D
  W: number
  H: number
  settings: ZikrSettings
  zikr: ReturnType<typeof getZikrById> extends infer T ? NonNullable<T> : never
  elapsedMs: number
  totalMs: number
  stepMs: number
  count: number
  bgImg: HTMLImageElement | null
  watermarkImg: HTMLImageElement | null
}

function drawZikrFrame({
  ctx,
  W,
  H,
  settings,
  zikr,
  elapsedMs,
  totalMs,
  stepMs,
  count,
  bgImg,
  watermarkImg,
}: DrawArgs) {
  // Background image (cover-fit)
  if (bgImg) {
    const ratio = Math.max(W / bgImg.width, H / bgImg.height)
    const dw = bgImg.width * ratio
    const dh = bgImg.height * ratio
    ctx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh)
  } else {
    ctx.fillStyle = '#0a0f1a'
    ctx.fillRect(0, 0, W, H)
  }

  // Overlay
  drawOverlay(ctx, W, H, settings)

  // Top + bottom gradient for legibility
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, 'rgba(0,0,0,0.22)')
  grad.addColorStop(0.18, 'rgba(0,0,0,0)')
  grad.addColorStop(0.78, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.30)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Top header
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.font = `500 ${Math.round(H * 0.016)}px Inter, sans-serif`
  // Letter-spacing for the uppercase tracking look
  type CtxWithLs = CanvasRenderingContext2D & { letterSpacing?: string }
  const ctxLs = ctx as CtxWithLs
  if (typeof ctxLs.letterSpacing === 'string') {
    try { ctxLs.letterSpacing = `${Math.round(H * 0.003)}px` } catch {}
  }
  ctx.fillText('ZIKR COUNTER', W / 2, H * 0.05)
  if (typeof ctxLs.letterSpacing === 'string') {
    try { ctxLs.letterSpacing = '0px' } catch {}
  }
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = `500 ${Math.round(H * 0.022)}px Inter, sans-serif`
  ctx.fillText(`${zikr.transliteration} · ${zikr.meaning}`, W / 2, H * 0.075)

  // ── Progress ring + counter ──
  const cx = W / 2
  const cy = H * 0.42
  const ringR = Math.round(Math.min(W, H) * 0.18)
  const ringW = Math.round(ringR * 0.06)
  const circumference = 2 * Math.PI * ringR

  // Background ring
  ctx.beginPath()
  ctx.arc(cx, cy, ringR, 0, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = ringW
  ctx.stroke()

  // Progress ring
  const progress = Math.min(1, Math.max(0, elapsedMs / totalMs))
  if (progress > 0) {
    ctx.beginPath()
    // Start at top (-π/2), go clockwise
    ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress)
    ctx.strokeStyle = settings.highlightColor
    ctx.lineWidth = ringW
    ctx.lineCap = 'round'
    ctx.shadowColor = settings.highlightColor
    ctx.shadowBlur = ringW * 2
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // Counter text inside the ring
  const leadInMs = 300
  const currentCount = Math.max(
    0,
    Math.min(count, Math.floor(Math.max(0, elapsedMs - leadInMs) / stepMs) + 1),
  )
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${Math.round(ringR * 0.7)}px "Inter", "ui-monospace", monospace`
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = ringR * 0.15
  ctx.fillText(String(currentCount), cx, cy - ringR * 0.05)
  ctx.shadowBlur = 0
  ctx.font = `400 ${Math.round(ringR * 0.18)}px Inter, sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText(`/ ${count}`, cx, cy + ringR * 0.35)

  // ── Arabic zikr text ──
  const arabicFontFamily = ARABIC_FONT_FAMILY[settings.arabicFont] ?? ARABIC_FONT_FAMILY.uthmani
  const arabicFontSize = Math.round(H * 0.052)
  ctx.fillStyle = settings.fontColor
  ctx.font = `${arabicFontSize}px ${arabicFontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.7)'
  ctx.shadowBlur = H * 0.008
  // Arabic is RTL — textAlign='center' handles it fine for canvas.
  ctx.fillText(zikr.arabic, W / 2, H * 0.62)
  ctx.shadowBlur = 0

  // Transliteration
  if (settings.showTransliteration) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = `italic ${Math.round(H * 0.022)}px Inter, sans-serif`
    ctx.fillText(zikr.transliteration, W / 2, H * 0.66)
  }

  // Meaning
  if (settings.showMeaning) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = `${Math.round(H * 0.020)}px Inter, sans-serif`
    ctx.fillText(zikr.meaning, W / 2, H * 0.69)
  }

  // ── Watermark (top-center) ──
  if (watermarkImg && watermarkImg.complete && watermarkImg.naturalWidth > 0) {
    const minDim = Math.min(W, H)
    const targetH = Math.round((minDim / 720) * 56)
    const scale = targetH / watermarkImg.naturalHeight
    const targetW = Math.round(watermarkImg.naturalWidth * scale)
    const x = Math.round((W - targetW) / 2)
    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.drawImage(watermarkImg, x, H * 0.025, targetW, targetH)
    ctx.restore()
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.font = `500 ${Math.round(H * 0.018)}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Made with Jariyah Now', W / 2, H * 0.025)
  }

  // ── Bottom caption ──
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = `500 ${Math.round(H * 0.014)}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(
    `${currentCount} of ${count} · ${formatMs(elapsedMs)} / ${formatMs(totalMs)}`.toUpperCase(),
    W / 2,
    H * 0.985,
  )
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  s: ZikrSettings,
) {
  const alpha = s.overlayOpacity / 100
  if (s.overlayStyle === 'none' || alpha <= 0) return
  switch (s.overlayStyle) {
    case 'solid': {
      ctx.fillStyle = `rgba(0,0,0,${alpha})`
      ctx.fillRect(0, 0, W, H)
      break
    }
    case 'bottom-gradient': {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, `rgba(0,0,0,${alpha})`)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      break
    }
    case 'top-gradient': {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, `rgba(0,0,0,${alpha})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      break
    }
    case 'vignette': {
      const g = ctx.createRadialGradient(
        W / 2, H / 2, Math.min(W, H) * 0.2,
        W / 2, H / 2, Math.max(W, H) * 0.7,
      )
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, `rgba(0,0,0,${alpha})`)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      break
    }
    case 'center-focus': {
      const g = ctx.createRadialGradient(
        W / 2, H / 2, 0,
        W / 2, H / 2, Math.max(W, H) * 0.7,
      )
      g.addColorStop(0, `rgba(0,0,0,${alpha})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      break
    }
  }
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
