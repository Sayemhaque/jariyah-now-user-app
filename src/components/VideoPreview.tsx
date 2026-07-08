'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useBuilderStore } from '@/lib/store'
import { RECITERS as RECITERS_LIST } from '@/lib/reciters'
import { overlayCssBackground } from '@/lib/overlay'
import { getActiveWordIndex } from '@/lib/highlight'
import { videoAttributionLine } from '@/lib/translations'
import { formatStructural, getStructuralPairs } from '@/lib/structural'
import {
  buildAudioSyncedChunks,
  buildTimeProportionalPlan,
  estimateChunkCount,
  findChunkAtTime,
  splitTranslationToChunks,
  shouldPaginate,
  type PaginationPlan,
} from '@/lib/textPagination'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

// Quick helper: returns true if the ayat has ANY structural markers to show.
// Used to conditionally render the bottom metadata strip.
function hasStructuralInfo(a: {
  juzNumber?: number
  hizbNumber?: number
  rubElHizbNumber?: number
  rukuNumber?: number
  manzilNumber?: number
  pageNumber?: number
}): boolean {
  return getStructuralPairs(a).length > 0
}

// Map the arabicFont setting to its CSS class. Falls back to Amiri if
// an unknown value slips through (shouldn't happen, but defensive).
const ARABIC_FONT_CLASS: Record<string, string> = {
  uthmani: 'font-arabic-uthmani',
  amiri: 'font-arabic-uthmani',
  scheherazade: 'font-arabic-scheherazade',
  naskh: 'font-arabic-naskh',
  kufi: 'font-arabic-kufi',
  cairo: 'font-arabic-cairo',
}

// Map the bengaliFont setting to its CSS class.
const BENGALI_FONT_CLASS: Record<string, string> = {
  sans: 'font-bengali-sans',
  serif: 'font-bengali-serif',
  hind: 'font-bengali-hind',
}

// ─── Text pagination helpers ─────────────────────────────────────────
// The audio-synced pagination logic lives in `@/lib/textPagination`.
// These helpers below are thin wrappers that build a per-ayat
// PaginationPlan (cached via useMemo) and translate the active chunk
// index into the visible slice of Arabic tokens + translation text.

// A flat list of renderable Arabic tokens — either individual words
// (with optional highlight index) or color-coded Tajweed fragments.
interface ArabicToken {
  text: string
  color?: string | null // null = use default font color
  wordIdx?: number // global word index (used for highlight matching)
}

function buildArabicTokens(current: {
  words: { text: string }[]
  tajweedSegments?: { text: string; color: string | null }[] | null
  arabicText: string
}): ArabicToken[] {
  if (current.words.length > 0) {
    return current.words.map((w, i) => ({ text: w.text, wordIdx: i }))
  }
  if (current.tajweedSegments && current.tajweedSegments.length > 0) {
    // Flatten Tajweed segments into individual words while preserving
    // the per-segment color. Splits on whitespace but keeps the color
    // attached to each resulting word.
    const tokens: ArabicToken[] = []
    for (const seg of current.tajweedSegments) {
      for (const part of seg.text.split(/\s+/)) {
        if (part) tokens.push({ text: part, color: seg.color })
      }
    }
    return tokens
  }
  if (current.arabicText) {
    return current.arabicText
      .split(/\s+/)
      .filter(Boolean)
      .map((text, i) => ({ text, wordIdx: i }))
  }
  return []
}

/**
 * Build the pagination plan for the current ayat. Prefers audio-synced
 * chunks (built from per-word timings) and falls back to time-proportional
 * when timings are missing. Returns a plan with `total <= 1` when the
 * ayat is short enough to not need pagination.
 */
function buildPlanForAyat(current: {
  words: { text: string; startMs: number; endMs: number }[]
  arabicText: string
  translation: string
  audioDurationMs: number
}): PaginationPlan {
  // Audio-synced path — needs word timings AND enough words to paginate.
  if (current.words.length > 0 && shouldPaginate(current.words)) {
    const plan = buildAudioSyncedChunks(current.words)
    if (plan.total > 1) return plan
  }
  // Fallback — time-proportional, word-count heuristic for chunk count.
  const arWords = current.arabicText.split(/\s+/).filter(Boolean).length
  const n = estimateChunkCount(arWords)
  if (n > 1 && current.audioDurationMs > 0) {
    return buildTimeProportionalPlan(current.audioDurationMs, n)
  }
  return { chunks: [], total: 0 }
}

const ASPECT: Record<string, { w: number; h: number; ratio: string }> = {
  landscape: { w: 1280, h: 720, ratio: '16 / 9' },
  portrait: { w: 720, h: 1280, ratio: '9 / 16' },
}

// Map textWidth setting → CSS max-width in cqw (container query units)
const TEXT_WIDTH_MAP: Record<string, string> = {
  full: '94cqw',
  wide: '82cqw',
  medium: '70cqw',
  narrow: '58cqw',
}

// Map textSpacing setting → CSS margin-top in cqw for the translation
const TEXT_SPACING_MAP: Record<string, string> = {
  compact: '1cqw',
  normal: '3cqw',
  spacious: '6cqw',
}

interface ActiveWord {
  ayatIndex: number
  wordIndex: number
}

export function VideoPreview() {
  const ayatList = useBuilderStore((s) => s.ayatList)
  const loading = useBuilderStore((s) => s.loadingAyats)
  const ayatError = useBuilderStore((s) => s.ayatError)
  const surahs = useBuilderStore((s) => s.surahs)
  const selectedSurahNumber = useBuilderStore((s) => s.selectedSurahNumber)
  const reciterId = useBuilderStore((s) => s.reciterId)
  const translationKey = useBuilderStore((s) => s.translationKey)
  const settings = useBuilderStore((s) => s.settings)
  const fromAyat = useBuilderStore((s) => s.fromAyat)
  const toAyat = useBuilderStore((s) => s.toAyat)

  // Derive surah + reciter from raw state with stable references.
  const surah = useMemo(
    () => surahs.find((s) => s.number === selectedSurahNumber),
    [surahs, selectedSurahNumber],
  )
  const reciter = useMemo(
    () => RECITERS_LIST.find((r) => r.id === reciterId) ?? RECITERS_LIST[0]!,
    [reciterId],
  )

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef<number | null>(null)
  // Preloader: a hidden Audio() object that fetches + decodes the NEXT
  // ayat's MP3 while the current one plays. When `onEnded` fires, we
  // swap the preloaded src into the main audio element so playback
  // resumes within ~50ms instead of the ~1000ms gap caused by fetching
  // + decoding on demand.
  const nextAudioRef = useRef<HTMLAudioElement | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const [liveDurations, setLiveDurations] = useState<Record<number, number>>({})
  const [textPage, setTextPage] = useState(0) // current pagination page for long text
  const [volume, setVolume] = useState(0.9)
  const [muted, setMuted] = useState(false)

  const current = ayatList[currentIndex]

  // Attribution line for the selected translation edition. Empty for
  // public-domain editions (no attribution needed). For permissive/personal
  // editions, shown at the bottom-left of the preview + export.
  const attributionLine = useMemo(
    () => videoAttributionLine(translationKey),
    [translationKey],
  )

  // Detect if the selected translation is Bengali — use the Bengali font
  // for the translation text in the preview.
  const isBengaliTranslation = translationKey.startsWith('bn.')

  const aspect = ASPECT[settings.orientation]

  // Total duration — use the probed audioDurationMs, or fall back to the
  // live duration captured from the actual <audio> element's loadedmetadata.
  // This handles the case where the probe returned 0 (COEP blocking the
  // separate Audio() element) but the real audio element in the page loads fine.
  const totalMs = useMemo(
    () =>
      ayatList.reduce(
        (sum, a, i) =>
          sum + (a.audioDurationMs || liveDurations[i] || 0),
        0,
      ),
    [ayatList, liveDurations],
  )

  // Cumulative offsets so the seek bar spans the whole range.
  const offsets = useMemo(() => {
    const arr: number[] = []
    let acc = 0
    for (let i = 0; i < ayatList.length; i++) {
      arr.push(acc)
      acc += ayatList[i]?.audioDurationMs || liveDurations[i] || 0
    }
    return arr
  }, [ayatList, liveDurations])

  // -- per-ayat word highlight, driven by audio.currentTime -------------
  const [activeWord, setActiveWord] = useState<ActiveWord | null>(null)

  // Use a ref to break the recursive self-reference inside `tick` — this
  // also lets us always read the latest `current`/`currentIndex` without
  // re-creating the rAF loop on every state change.
  const stateRef = useRef({ current, currentIndex })
  useEffect(() => {
    stateRef.current = { current, currentIndex }
  }, [current, currentIndex])

  useEffect(() => {
    if (!isPlaying) return
    let cancelled = false

    const tick = () => {
      if (cancelled) return
      const audio = audioRef.current
      const { current: c, currentIndex: ci } = stateRef.current
      if (audio && c) {
        const tMs = audio.currentTime * 1000
        setCurrentTimeMs(tMs)
        // ─── Audio-synced pagination ────────────────────────────────
        // Build the chunk plan for this ayat (cheap; pure function of
        // the ayat's word timings + duration). Then find which chunk
        // is active at the current audio position.
        //
        // We DON'T memoize here because the tick runs every frame and
        // we want zero stale closures — `buildPlanForAyat` is fast
        // enough (a few hundred microseconds for a 50-word ayat).
        const dur = c.audioDurationMs || liveDurations[ci] || 0
        const plan = buildPlanForAyat({
          words: c.words,
          arabicText: c.arabicText,
          translation: c.translation,
          audioDurationMs: dur,
        })
        if (plan.total > 1) {
          let page = findChunkAtTime(plan.chunks, tMs)
          if (page < 0) page = 0
          // Only update state when the page actually changes — avoids
          // a needless React re-render every animation frame.
          setTextPage((prev) => (prev === page ? prev : page))
        } else if (plan.total <= 1) {
          setTextPage((prev) => (prev === 0 ? prev : 0))
        }
        const foundIdx = getActiveWordIndex(c.words, tMs)
        if (foundIdx >= 0) {
          setActiveWord({ ayatIndex: ci, wordIndex: foundIdx })
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying])

  // -- playback controls -------------------------------------------------
  const playAyat = useCallback(
    (idx: number) => {
      if (!ayatList[idx]) return
      const audio = audioRef.current
      if (!audio) return
      setCurrentIndex(idx)
      setActiveWord(null)
      setCurrentTimeMs(0)
      setTextPage(0) // reset pagination when switching ayats
      audio.src = ayatList[idx]!.audioUrl
      audio.volume = volume
      audio.muted = muted
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay can fail; show paused state and let the user retry.
        setIsPlaying(false)
      })
    },
    [ayatList, volume, muted],
  )

  // ─── Preload the NEXT ayat's MP3 in parallel ─────────────────────────
  // Whenever currentIndex changes, kick off a hidden Audio() download of
  // the next ayat's MP3. The browser fetches + decodes it in the
  // background. When the current ayat ends, we swap the preloaded src
  // into the main audio element — playback resumes in ~50ms instead of
  // the ~1000ms gap caused by fetching on demand.
  useEffect(() => {
    if (!ayatList.length) return
    const nextIdx = currentIndex + 1
    if (nextIdx >= ayatList.length) return // last ayat — nothing to preload
    const nextUrl = ayatList[nextIdx]?.audioUrl
    if (!nextUrl) return

    // Reuse the same hidden Audio() instance, just swap the src.
    // `preload='auto'` tells the browser to fetch + buffer aggressively.
    if (!nextAudioRef.current) {
      nextAudioRef.current = new Audio()
    }
    const nextAudio = nextAudioRef.current
    // Skip if already preloading/loaded this exact URL (avoid re-fetch).
    if (nextAudio.src !== nextUrl) {
      nextAudio.src = nextUrl
      nextAudio.preload = 'auto'
      // Some browsers won't actually fetch until play() is called.
      // Calling play() then immediately pausing forces the preload
      // without producing audible sound.
      nextAudio.muted = true
      nextAudio.volume = 0
      nextAudio.play().then(() => {
        nextAudio.pause()
        nextAudio.currentTime = 0
        nextAudio.muted = false
        nextAudio.volume = 1
      }).catch(() => {
        // Autoplay policy blocked the preload — fall back to setting
        // preload='auto' and letting the browser fetch metadata-only.
        nextAudio.muted = false
        nextAudio.volume = 1
      })
    }
  }, [currentIndex, ayatList])

  // Cleanup: release the preloader Audio() when the component unmounts
  // so it doesn't keep a network connection open in the background.
  useEffect(() => {
    return () => {
      if (nextAudioRef.current) {
        nextAudioRef.current.src = ''
        nextAudioRef.current = null
      }
    }
  }, [])

  // Auto-advance on ended
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => {
      if (currentIndex < ayatList.length - 1) {
        playAyat(currentIndex + 1)
      } else {
        // Last ayat just finished — pin the seek bar to the very end so it
        // visually shows 100% completion (instead of jumping back to the
        // start of the last ayat, which is what resetting currentTimeMs to
        // 0 would do).
        setIsPlaying(false)
        setActiveWord(null)
        const lastAyat = ayatList[currentIndex]
        const lastDur = lastAyat?.audioDurationMs ?? 0
        setCurrentTimeMs(lastDur)
      }
    }
    audio.addEventListener('ended', onEnded)

    // Capture the duration from the real audio element when it loads.
    // This is the fallback for when the probe (getAudioDurationMs) returned 0
    // because COEP blocked the separate Audio() element.
    const onMeta = () => {
      const d = audio.duration
      if (isFinite(d) && d > 0) {
        setLiveDurations((prev) => {
          if (prev[currentIndex] === d * 1000) return prev
          return { ...prev, [currentIndex]: d * 1000 }
        })
      }
    }
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)

    return () => {
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
    }
  }, [currentIndex, ayatList.length, ayatList, playAyat])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!ayatList.length) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      // If audio is empty (first play), load current ayat
      if (!audio.src || audio.src === window.location.href) {
        playAyat(currentIndex)
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      }
    }
  }

  const onSeek = (v: number[]) => {
    const target = v[0]!
    // find which ayat this falls into
    let idx = 0
    for (let i = 0; i < offsets.length; i++) {
      const start = offsets[i]!
      const end = start + (ayatList[i]?.audioDurationMs || 0)
      if (target >= start && target < end) {
        idx = i
        break
      }
      if (i === offsets.length - 1) idx = i
    }
    const into = target - (offsets[idx] || 0)
    if (idx !== currentIndex) {
      setCurrentIndex(idx)
      setTextPage(0) // reset pagination when jumping to a different ayat
      const audio = audioRef.current!
      audio.src = ayatList[idx]!.audioUrl
      audio.currentTime = into / 1000
      audio.volume = volume
      audio.muted = muted
      if (isPlaying) audio.play().catch(() => {})
    } else {
      const audio = audioRef.current!
      audio.currentTime = into / 1000
    }
    setCurrentTimeMs(into)
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      audioRef.current.muted = muted
    }
  }, [volume, muted])

  // Reset when the ayat list changes. This is the documented React
  // "reset all state when a prop changes" pattern — we can't use a `key`
  // here because the player owns the audio element. The setState calls
  // only fire when ayatList identity changes, so there's no cascading.
  const prevListRef = useRef(ayatList)
  useEffect(() => {
    if (prevListRef.current === ayatList) return
    prevListRef.current = ayatList
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentIndex(0)
    setIsPlaying(false)
    setActiveWord(null)
    setCurrentTimeMs(0)
    setLiveDurations({})
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
    }
  }, [ayatList])

  // Pre-probe audio durations for all ayats when the list loads.
  // The store's getAudioDurationMs may return 0 under COEP — this is a
  // second attempt using the actual audio element in the DOM. We load each
  // ayat's audio URL silently (muted, not playing) just to get the metadata.
  useEffect(() => {
    if (!ayatList.length) return
    const probes: HTMLAudioElement[] = []
    ayatList.forEach((ayat, i) => {
      if (ayat.audioDurationMs > 0) return // already have it
      const a = new Audio()
      a.preload = 'metadata'
      a.crossOrigin = 'anonymous'
      a.onloadedmetadata = () => {
        const d = a.duration
        if (isFinite(d) && d > 0) {
          setLiveDurations((prev) => ({ ...prev, [i]: d * 1000 }))
        }
      }
      a.src = ayat.audioUrl
      probes.push(a)
    })
    return () => {
      probes.forEach((a) => { a.src = '' })
    }
  }, [ayatList])

  // Build the overlay background expression from the user's chosen preset.
  const overlayBg = overlayCssBackground(settings)

  // Detect if the selected background is a looping MP4 video. The preset
  // URL ends with `.mp4` (e.g. /backgrounds/videos/rain.mp4). When true,
  // we render a <video> element behind the content instead of using CSS
  // `background-image`. The export pipeline (ExportModal.tsx) detects the
  // same condition and seeks the video frame-by-frame onto the canvas.
  const isVideoBg = settings.backgroundImage.endsWith('.mp4')

  // Find the word to highlight in the current ayat
  const highlightedWordIdx =
    activeWord && activeWord.ayatIndex === currentIndex
      ? activeWord.wordIndex
      : -1

  // ─── Memoized audio-synced pagination plan for the CURRENT ayat ────
  // Built once per ayat (or per duration change). The rAF tick uses
  // the same plan to decide which chunk is active at `audio.currentTime`.
  // This drives the live preview's text pagination — chunk N switches
  // the instant the reciter finishes the last word in chunk N.
  const paginationPlan = useMemo<PaginationPlan>(() => {
    if (!current) return { chunks: [], total: 0 }
    const dur = current.audioDurationMs || liveDurations[currentIndex] || 0
    return buildPlanForAyat({
      words: current.words,
      arabicText: current.arabicText,
      translation: current.translation,
      audioDurationMs: dur,
    })
  }, [current, currentIndex, liveDurations])

  // Translate the current `textPage` state into the visible slice of
  // Arabic tokens + the matching translation piece. Both are derived
  // from the SAME plan so they always advance in lockstep.
  const visibleArabicRange = useMemo<{ start: number; end: number }>(() => {
    if (paginationPlan.total <= 1 || textPage < 0) {
      return { start: 0, end: -1 } // -1 = "all"
    }
    const chunk = paginationPlan.chunks[textPage]
    return chunk
      ? { start: chunk.wordStart, end: chunk.wordEnd }
      : { start: 0, end: -1 }
  }, [paginationPlan, textPage])

  const visibleTranslation = useMemo<string>(() => {
    if (!current) return ''
    if (paginationPlan.total <= 1) return current.translation
    const pieces = splitTranslationToChunks(
      current.translation,
      paginationPlan.total,
    )
    return pieces[textPage] ?? ''
  }, [current, paginationPlan, textPage])

  // Font sizes scale with the ACTUAL preview frame width using CSS container
  // query units (cqw = 1% of the container's inline size). This way, the text
  // is always proportional to the preview, not the browser viewport — so a
  // narrow portrait reel gets smaller text and a wide landscape preview gets
  // larger text, automatically.
  //
  // The user's font-size slider acts as a multiplier on top of the base
  // percentage. Reference sizes match AUTO_FONT_SIZES.
  const orientationFontBase: Record<string, { ar: number; tr: number; arRef: number; trRef: number }> = {
    portrait: { ar: 7.0, tr: 2.8, arRef: 30, trRef: 14 },
    landscape: { ar: 4.5, tr: 1.8, arRef: 34, trRef: 15 },
  }
  const fb = orientationFontBase[settings.orientation]!
  const arCqw = (fb.ar * settings.arabicFontSize / fb.arRef).toFixed(2)
  const trCqw = (fb.tr * settings.translationFontSize / fb.trRef).toFixed(2)
  const arabicFontSizeCss = `${arCqw}cqw`
  const translationFontSizeCss = `${trCqw}cqw`

  return (
    <div className="flex flex-col h-full">
      {/* Hidden audio element drives playback + word timing */}
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />

      {/* Preview frame — sized so portrait fills the available height (reel-like)
          and landscape fills the available width. The frame is also a CSS
          container so cqw units inside it scale with its actual width. */}
      <div className="flex-1 min-h-0 grid place-items-center p-3 sm:p-6">
        <div
          className="qv-smooth relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
          style={{
            aspectRatio: aspect.ratio,
            // Portrait: fill the height, derive width from aspect-ratio.
            // Landscape: fill the width, cap height so it never overflows.
            ...(settings.orientation === 'portrait'
              ? { height: '100%', width: 'auto', maxWidth: '100%' }
              : { width: '100%', maxHeight: '100%', height: 'auto' }),
            containerType: 'inline-size',
            // For image backgrounds, the cover-fit image is set via CSS
            // `background-image`. For video backgrounds, we render a
            // <video> element behind the content (see below) and leave
            // the CSS background empty so the video shows through.
            backgroundImage: isVideoBg
              ? undefined
              : `url(${settings.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: isVideoBg ? '#0a0a14' : undefined,
          }}
        >
          {/* Looping video background — played muted behind the content.
              Covers the frame (object-cover) so it always fills the
              aspect ratio cleanly. Auto-plays + loops infinitely. */}
          {isVideoBg && (
            <video
              key={settings.backgroundImage}
              src={settings.backgroundImage}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          )}

          {/* Overlay (rendered using the user's selected preset shape) */}
          {overlayBg && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: overlayBg }}
            />
          )}

          {/* Subtle top + bottom gradient for legibility (always on, regardless
              of overlay preset — guarantees the header + watermark stay readable) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.30) 100%)',
            }}
          />

          {/* Top header bar — surah name + ayat indicator (scales with frame) */}
          {surah && current && (
            <div
              className="absolute top-0 inset-x-0 flex items-start justify-between text-white"
              style={{ padding: '4cqw 5cqw' }}
            >
              <div className="flex flex-col">
                <span
                  lang="ar"
                  className="font-arabic-uthmani leading-tight drop-shadow-lg"
                  style={{ fontSize: '5cqw' }}
                >
                  {surah.arabicName}
                </span>
                <span
                  className="uppercase tracking-[0.12em] opacity-75 mt-0.5"
                  style={{ fontSize: '2cqw' }}
                >
                  {surah.name} · {surah.revelationType}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className="font-arabic-uthmani leading-tight drop-shadow-lg"
                  style={{ fontSize: '4.2cqw' }}
                >
                  {surah.number}:{current.ayatNumber}
                </span>
                <span
                  className="uppercase tracking-[0.18em] opacity-65 mt-0.5"
                  style={{ fontSize: '1.8cqw' }}
                >
                  Ayat {currentIndex + 1} of {ayatList.length}
                </span>
              </div>
            </div>
          )}

          {/* Center content — Arabic + transliteration + translation grouped
              tightly into one visual block. No card border (per spec).
              Padding scales with the frame so it stays proportional. */}
          {current ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ padding: '0 8cqw' }}
            >
              <div
                className="qv-smooth relative flex flex-col items-center rounded-2xl"
                style={{
                  maxWidth: TEXT_WIDTH_MAP[settings.textWidth],
                  backgroundColor: 'rgba(15, 15, 20, 0.6)',
                  padding: '4cqw 5cqw',
                  borderRadius: '3cqw',
                  boxShadow: '0 2cqw 6cqw rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Arabic — word-by-word highlight, paginated for long ayats */}
                <div
                  dir="rtl"
                  lang="ar"
                  className={cn(
                    'qv-smooth text-center leading-[1.75] drop-shadow-lg',
                    ARABIC_FONT_CLASS[settings.arabicFont] ?? 'font-arabic-uthmani',
                  )}
                  style={{
                    color: settings.fontColor,
                    fontSize: arabicFontSizeCss,
                  }}
                >
                  {(() => {
                    if (!current) return null
                    const tokens = buildArabicTokens(current)
                    if (!tokens.length) return null

                    // Slice tokens to the current chunk's word range.
                    // When not paginating, visibleArabicRange.end === -1
                    // → show everything.
                    const visible =
                      visibleArabicRange.end < 0
                        ? tokens
                        : tokens.slice(
                            visibleArabicRange.start,
                            visibleArabicRange.end,
                          )

                    return visible.map((tok, i) => {
                      const isHi =
                        tok.wordIdx !== undefined &&
                        tok.wordIdx === highlightedWordIdx
                      return (
                        <span
                          key={i}
                          className="qv-smooth inline-block mx-[1px]"
                          style={{
                            color: isHi
                              ? settings.highlightColor
                              : (tok.color ?? settings.fontColor),
                            textShadow: isHi
                              ? `0 0 18px ${settings.highlightColor}88, 0 1px 4px rgba(0,0,0,0.7)`
                              : '0 1px 4px rgba(0,0,0,0.7)',
                            transition: 'color 120ms ease',
                          }}
                        >
                          {tok.text}
                        </span>
                      )
                    })
                  })()}
                </div>

                {/* Tiny divider between Arabic and translation — only when
                    both are visible. */}
                {settings.showTranslation &&
                  settings.showTransliteration &&
                  current.words.length > 0 && (
                    <div
                      className="my-2 h-px opacity-40"
                      style={{ backgroundColor: settings.fontColor, width: '12cqw' }}
                    />
                  )}

                {/* Transliteration — sits right under Arabic (scales with frame) */}
                {settings.showTransliteration && current.words.length > 0 && (
                  <div
                    className="qv-smooth text-center italic text-white/70 leading-snug"
                    style={{ fontSize: '2.4cqw', maxWidth: '80cqw' }}
                  >
                    {current.words
                      .map((w) => w.transliteration || '')
                      .filter(Boolean)
                      .join(' ')}
                  </div>
                )}

                {/* Translation — sits right under Arabic (or transliteration).
                    Tight gap, scales with frame. Uses the selected Bengali
                    font when the translation is Bengali, otherwise the
                    default UI font (Inter). */}
                {settings.showTranslation && (
                  <p
                    className={`qv-smooth text-white/85 mx-auto leading-snug drop-shadow text-center ${isBengaliTranslation ? (BENGALI_FONT_CLASS[settings.bengaliFont] ?? 'font-bengali-sans') : ''}`}
                    style={{
                      fontSize: translationFontSizeCss,
                      marginTop: TEXT_SPACING_MAP[settings.textSpacing],
                      maxWidth: '85cqw',
                    }}
                  >
                    {visibleTranslation}
                  </p>
                )}

                {/* Page indicator — shows "1 / 3" when text is paginated */}
                {paginationPlan.total > 1 ? (
                  <div className="text-white/35 text-[1.4cqw] font-mono mt-1.5">
                    {Math.min(textPage + 1, paginationPlan.total)} /{' '}
                    {paginationPlan.total}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-center text-white/70 px-6">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm">Loading ayat data…</span>
                </div>
              ) : ayatError ? (
                <div className="space-y-3">
                  <p className="text-sm text-destructive">{ayatError}</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-sm">
                  <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20 mx-auto">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-white/90">
                      Your recitation video will appear here
                    </p>
                    <p className="text-xs text-white/55 leading-relaxed">
                      Pick a surah and ayat range, choose a reciter, then click{' '}
                      <span className="text-primary font-medium">Load ayats</span>{' '}
                      to preview with word-by-word highlighting.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attribution block — bottom-left. Shows the translation attribution
              line (when the edition requires it) + the reciter credit (always).
              Stacked vertically so both are visible. */}
          {(attributionLine || ayatList.length > 0) && (
            <div
              className="absolute text-white/55 font-sans leading-tight max-w-[55%] space-y-0.5"
              style={{
                bottom: '2.5cqw',
                left: '3.5cqw',
                fontSize: '2.4cqw',
              }}
            >
              {attributionLine && <div>{attributionLine}</div>}
              {ayatList.length > 0 && (
                <div>Recited by {reciter.name}</div>
              )}
            </div>
          )}

          {/* Structural Quran markers — Juz, Hizb, Rubʿ al-Hizb, Ruku,
              Manzil, Page. Sourced from the quran.com API. Shown at the
              bottom-center of the frame, just above the attribution block,
              so users can see which part of the Quran the current ayat
              belongs to. Only shows fields that are actually present. */}
          {current && hasStructuralInfo(current) && (
            <div
              className="absolute left-1/2 -translate-x-1/2 text-white/55 font-sans tracking-[0.08em] whitespace-nowrap"
              style={{
                bottom: '2.8cqw',
                fontSize: '1.7cqw',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              }}
            >
              {formatStructural(current, false)}
            </div>
          )}

          {/* Top-center watermark — the Jariyah Now brand mark (cleaned
              transparent PNG at /public/watermark.png). Mirrors what
              gets baked into the exported MP4 by ExportModal.drawFrame,
              so the user sees the same branding in the live preview as
              they will in the final video. */}
          <img
            src="/watermark.png"
            alt=""
            aria-hidden="true"
            className="absolute pointer-events-none select-none"
            style={{
              top: '4cqw',
              left: '50%',
              transform: 'translateX(-50%)',
              height: '14cqw',
              width: 'auto',
              opacity: 0.9,
              filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))',
            }}
          />
        </div>
      </div>

      {/* Controls bar — light theme, responsive: 1 row on desktop, 2 rows on mobile */}
      <div className="border-t border-border bg-card px-3 sm:px-5 py-2.5 sm:py-3 space-y-2">
        {/* Row 1: transport buttons + seek bar + volume (desktop) / transport + seek (mobile) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-muted"
              disabled={!ayatList.length}
              onClick={() => playAyat(Math.max(0, currentIndex - 1))}
              title="Previous ayat"
              aria-label="Previous ayat"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-11 w-11 rounded-full qv-btn-primary"
              disabled={!ayatList.length}
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
              disabled={!ayatList.length || currentIndex >= ayatList.length - 1}
              onClick={() => playAyat(Math.min(ayatList.length - 1, currentIndex + 1))}
              title="Next ayat"
              aria-label="Next ayat"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Seek bar — flex-1 so it fills available space on all screens */}
          <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
            <Slider
              value={[
                Math.min(
                  totalMs,
                  (offsets[currentIndex] || 0) + currentTimeMs,
                ),
              ]}
              max={Math.max(1, totalMs)}
              step={100}
              onValueChange={onSeek}
              disabled={!ayatList.length}
              className="flex-1 min-w-0"
            />
            <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap tabular-nums shrink-0">
              {formatMs((offsets[currentIndex] || 0) + currentTimeMs)} /{' '}
              {formatMs(totalMs)}
            </span>
          </div>

          {/* Volume — hidden on mobile (use device volume), shown on sm+ */}
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

          {/* Mute-only on mobile */}
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

        {/* Row 2: status line */}
        {ayatList.length > 0 && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <span className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-foreground/80 truncate">{surah?.name}</span>
              <span className="opacity-50 shrink-0">·</span>
              <span className="tabular-nums shrink-0">
                Ayats {fromAyat}–{toAyat}
              </span>
              <span className="opacity-50 shrink-0 hidden xs:inline">·</span>
              <span className="hidden xs:inline truncate">{reciter.name}</span>
            </span>
            <span className="flex items-center gap-1.5 text-foreground/70 shrink-0">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary qv-pulse" />
              <span className="uppercase tracking-[0.15em] text-[10px]">
                Live preview
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00'
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
