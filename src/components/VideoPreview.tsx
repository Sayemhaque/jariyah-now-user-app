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
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

const ASPECT: Record<string, { w: number; h: number; ratio: string }> = {
  landscape: { w: 1280, h: 720, ratio: '16 / 9' },
  portrait: { w: 720, h: 1280, ratio: '9 / 16' },
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

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
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

  const aspect = ASPECT[settings.orientation]

  // Total duration estimate based on known audio durations.
  const totalMs = useMemo(
    () => ayatList.reduce((sum, a) => sum + (a.audioDurationMs || 0), 0),
    [ayatList],
  )

  // Cumulative offsets so the seek bar spans the whole range.
  const offsets = useMemo(() => {
    const arr: number[] = []
    let acc = 0
    for (const a of ayatList) {
      arr.push(acc)
      acc += a.audioDurationMs || 0
    }
    return arr
  }, [ayatList])

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
    return () => audio.removeEventListener('ended', onEnded)
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
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
    }
  }, [ayatList])

  // Build the overlay background expression from the user's chosen preset.
  const overlayBg = overlayCssBackground(settings)

  // Find the word to highlight in the current ayat
  const highlightedWordIdx =
    activeWord && activeWord.ayatIndex === currentIndex
      ? activeWord.wordIndex
      : -1

  // Font sizes scale with the ACTUAL preview frame width using CSS container
  // query units (cqw = 1% of the container's inline size). This way, the text
  // is always proportional to the preview, not the browser viewport — so a
  // narrow portrait reel gets smaller text and a wide landscape preview gets
  // larger text, automatically.
  //
  // The user's font-size slider acts as a multiplier on top of the base
  // percentage. Reference sizes: portrait Arabic=40 at 8cqw, landscape
  // Arabic=36 at 5cqw. So multiplier = sliderValue / referenceValue.
  const orientationFontBase: Record<string, { ar: number; tr: number; arRef: number; trRef: number }> = {
    portrait: { ar: 8.0, tr: 3.0, arRef: 40, trRef: 16 },
    landscape: { ar: 5.0, tr: 1.9, arRef: 36, trRef: 15 },
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
            backgroundImage: `url(${settings.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
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
              <div className="qv-smooth relative flex flex-col items-center" style={{ maxWidth: '90cqw' }}>
                {/* Arabic — word-by-word highlight */}
                <div
                  dir="rtl"
                  lang="ar"
                  className={cn(
                    'qv-smooth text-center leading-[1.75] drop-shadow-lg',
                    settings.fontStyle === 'uthmani'
                      ? 'font-arabic-uthmani'
                      : 'font-arabic-naskh',
                  )}
                  style={{
                    color: settings.fontColor,
                    fontSize: arabicFontSizeCss,
                  }}
                >
                  {current.words.length > 0
                    ? current.words.map((w, i) => (
                        <span
                          key={i}
                          className="qv-smooth inline-block mx-[1px]"
                          style={{
                            color:
                              i === highlightedWordIdx
                                ? settings.highlightColor
                                : settings.fontColor,
                            textShadow:
                              i === highlightedWordIdx
                                ? `0 0 18px ${settings.highlightColor}88, 0 1px 4px rgba(0,0,0,0.7)`
                                : '0 1px 4px rgba(0,0,0,0.7)',
                            transition: 'color 120ms ease',
                          }}
                        >
                          {w.text}
                        </span>
                      ))
                    : current.arabicText}
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
                    Tight gap, scales with frame. */}
                {settings.showTranslation && (
                  <p
                    className="qv-smooth text-white/85 mx-auto leading-snug drop-shadow text-center"
                    style={{
                      fontSize: translationFontSizeCss,
                      marginTop: '1.5cqw',
                      maxWidth: '85cqw',
                    }}
                  >
                    {current.translation}
                  </p>
                )}
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

          {/* Watermark — decorative, aria-hidden for screen readers */}
          <div
            aria-hidden="true"
            className="absolute tracking-[0.2em] text-white/50 font-mono uppercase"
            style={{
              bottom: '2.5cqw',
              right: '3.5cqw',
              fontSize: '2cqw',
            }}
          >
            QuranVid
          </div>
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
