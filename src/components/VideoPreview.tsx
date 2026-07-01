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
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

const ASPECT: Record<string, { w: number; h: number; ratio: string }> = {
  landscape: { w: 1280, h: 720, ratio: '16 / 9' },
  portrait: { w: 720, h: 1280, ratio: '9 / 16' },
  square: { w: 1080, h: 1080, ratio: '1 / 1' },
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
        let foundIdx = -1
        for (let i = 0; i < c.words.length; i++) {
          const w = c.words[i]!
          const end =
            w.endMs ||
            (i + 1 < c.words.length ? c.words[i + 1]!.startMs : tMs + 1)
          if (tMs >= w.startMs && tMs < end) {
            foundIdx = i
            break
          }
        }
        if (foundIdx >= 0) {
          setActiveWord({ ayatIndex: ci, wordIndex: foundIdx })
        } else if (tMs > 0 && c.words.length) {
          setActiveWord({ ayatIndex: ci, wordIndex: c.words.length - 1 })
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
        setIsPlaying(false)
        setActiveWord(null)
        setCurrentTimeMs(0)
      }
    }
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [currentIndex, ayatList.length, playAyat])

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

  // Font sizes auto-scale to the preview frame's width based on orientation.
  // We translate the user's "design-space" font size (24–72 for Arabic,
  // 14–32 for translation) into a viewport-relative CSS clamp that adapts to
  // the actual rendered preview width.
  //   portrait  → frame is tall and narrow → bigger relative size
  //   square    → medium
  //   landscape → frame is wide and short → slightly smaller relative size
  const orientationFontScale: Record<string, { ar: string; tr: string }> = {
    portrait: { ar: '5.2vw', tr: '1.7vw' },
    square: { ar: '4.2vw', tr: '1.5vw' },
    landscape: { ar: '3.4vw', tr: '1.3vw' },
  }
  const fontScale = orientationFontScale[settings.orientation]!
  const arabicFontSizeCss = `clamp(18px, ${fontScale.ar}, ${settings.arabicFontSize}px)`
  const translationFontSizeCss = `clamp(10px, ${fontScale.tr}, ${settings.translationFontSize}px)`

  return (
    <div className="flex flex-col h-full">
      {/* Hidden audio element drives playback + word timing */}
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />

      {/* Preview frame */}
      <div className="flex-1 min-h-0 grid place-items-center p-3 sm:p-6">
        <div
          className="qv-smooth relative w-full max-h-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
          style={{
            aspectRatio: aspect.ratio,
            maxWidth:
              settings.orientation === 'landscape'
                ? '100%'
                : settings.orientation === 'square'
                ? 'min(100%, 72vh)'
                : 'min(100%, 72vh)',
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

          {/* Top header bar — surah name + ayat indicator */}
          {surah && current && (
            <div className="absolute top-0 inset-x-0 px-5 sm:px-6 pt-4 sm:pt-5 flex items-start justify-between text-white">
              <div className="flex flex-col">
                <span className="font-arabic-uthmani text-xl sm:text-2xl leading-tight drop-shadow-lg">
                  {surah.arabicName}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.12em] opacity-75 mt-0.5">
                  {surah.name} · {surah.revelationType}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-arabic-uthmani text-lg sm:text-xl leading-tight drop-shadow-lg">
                  {surah.number}:{current.ayatNumber}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] opacity-65 mt-0.5">
                  Ayat {currentIndex + 1} of {ayatList.length}
                </span>
              </div>
            </div>
          )}

          {/* Center content — Arabic + transliteration + translation grouped
              tightly into one visual block. No card border (per spec). */}
          {current ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-10">
              <div className="qv-smooth relative flex flex-col items-center max-w-[88%]">
                {/* Arabic — word-by-word highlight */}
                <div
                  dir="rtl"
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
                      className="my-2 h-px w-12 opacity-40"
                      style={{ backgroundColor: settings.fontColor }}
                    />
                  )}

                {/* Transliteration — sits right under Arabic */}
                {settings.showTransliteration && current.words.length > 0 && (
                  <div
                    className="qv-smooth text-center italic text-white/70 max-w-md leading-snug"
                    style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}
                  >
                    {current.words
                      .map((w) => w.transliteration || '')
                      .filter(Boolean)
                      .join(' ')}
                  </div>
                )}

                {/* Translation — sits right under Arabic (or transliteration).
                    Tight 0.6rem gap. */}
                {settings.showTranslation && (
                  <p
                    className="qv-smooth text-white/85 mx-auto max-w-xl leading-snug drop-shadow text-center"
                    style={{
                      fontSize: translationFontSizeCss,
                      marginTop: '0.6rem',
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

          {/* Watermark — stripped in the final export */}
          <div className="absolute bottom-2.5 right-3.5 text-[10px] tracking-[0.2em] text-white/35 font-mono uppercase">
            QuranVid
          </div>
        </div>
      </div>

      {/* Controls bar — refined, professional transport */}
      <div className="border-t border-border bg-card/60 qv-frosted px-4 sm:px-5 py-3 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-secondary/60"
            disabled={!ayatList.length}
            onClick={() => playAyat(Math.max(0, currentIndex - 1))}
            title="Previous ayat"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-11 w-11 rounded-full qv-btn-primary border border-primary/30"
            disabled={!ayatList.length}
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
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
            className="h-9 w-9 rounded-lg hover:bg-secondary/60"
            disabled={!ayatList.length || currentIndex >= ayatList.length - 1}
            onClick={() => playAyat(Math.min(ayatList.length - 1, currentIndex + 1))}
            title="Next ayat"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="flex-1 flex items-center gap-3 mx-2">
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
              className="flex-1"
            />
            <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap tabular-nums">
              {formatMs((offsets[currentIndex] || 0) + currentTimeMs)} /{' '}
              {formatMs(totalMs)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-secondary/60"
              onClick={() => setMuted((m) => !m)}
              title={muted ? 'Unmute' : 'Mute'}
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
        </div>
        {ayatList.length > 0 && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <span className="flex items-center gap-2">
              <span className="font-medium text-foreground/80">{surah?.name}</span>
              <span className="opacity-50">·</span>
              <span className="tabular-nums">
                Ayats {fromAyat}–{toAyat}
              </span>
              <span className="opacity-50">·</span>
              <span>{reciter.name}</span>
            </span>
            <span className="flex items-center gap-1.5 text-primary/80">
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
