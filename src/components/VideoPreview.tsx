'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
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
import { videoAttributionLine } from '@/lib/translations'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

const ARABIC_FONT_CLASS: Record<string, string> = {
  uthmani: 'font-arabic-uthmani',
  amiri: 'font-arabic-uthmani',
  scheherazade: 'font-arabic-scheherazade',
  markazi: 'font-arabic-markazi',
  naskh: 'font-arabic-naskh',
  kufi: 'font-arabic-kufi',
  cairo: 'font-arabic-cairo',
}

const BENGALI_FONT_CLASS: Record<string, string> = {
  sans: 'font-bengali-sans',
  serif: 'font-bengali-serif',
  hind: 'font-bengali-hind',
}

function buildArabicTokens(arabicText: string): string[] {
  if (!arabicText) return []
  return arabicText.split(/\s+/).filter(Boolean)
}

const ASPECT: Record<string, { w: number; h: number; ratio: string }> = {
  landscape: { w: 1280, h: 720, ratio: '16 / 9' },
  portrait: { w: 720, h: 1280, ratio: '9 / 16' },
}

const TEXT_WIDTH_MAP: Record<string, string> = {
  full: '94cqw',
  wide: '82cqw',
  medium: '70cqw',
  narrow: '58cqw',
}

const TEXT_SPACING_MAP: Record<string, string> = {
  compact: '1cqw',
  normal: '3cqw',
  spacious: '6cqw',
}

const AUDIO_HANDOFF_BUFFER_MS = 80

function getAdvanceAtMs(
  ayat: {
    audioDurationMs: number
    audioPauses?: { start: number; end: number; duration: number }[]
  } | null | undefined,
  liveDurationMs: number,
): number {
  if (!ayat) return 0

  const totalMs = ayat.audioDurationMs || liveDurationMs || 0
  if (totalMs <= 0) return 0

  const trailingPause = ayat.audioPauses?.[ayat.audioPauses.length - 1]
  if (!trailingPause) return totalMs

  const remainingMs = totalMs - trailingPause.end
  const remainingFraction = remainingMs / totalMs
  // Only advance early if:
  // 1. The remaining time is between 120ms and 1500ms (not a real verse gap)
  // 2. The remaining time is less than 8% of total duration (not a mid-ayah pause near end)
  if (remainingMs >= 120 && remainingMs <= 1500 && remainingFraction < 0.08) {
    return Math.max(0, Math.min(totalMs, trailingPause.end + AUDIO_HANDOFF_BUFFER_MS))
  }

  return totalMs
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
  const autoAdvancedAyatRef = useRef<number | null>(null)
  const nextAudioRef = useRef<HTMLAudioElement | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const [liveDurations, setLiveDurations] = useState<Record<number, number>>({})
  const [volume, setVolume] = useState(0.9)
  const [muted, setMuted] = useState(false)

  const current = ayatList[currentIndex]
  const attributionLine = useMemo(
    () => videoAttributionLine(translationKey),
    [translationKey],
  )
  const isBengaliTranslation = translationKey.startsWith('bn.')
  const aspect = ASPECT[settings.orientation]

  const totalMs = useMemo(
    () =>
      ayatList.reduce(
        (sum, a, i) => sum + (a.audioDurationMs || liveDurations[i] || 0),
        0,
      ),
    [ayatList, liveDurations],
  )

  const offsets = useMemo(() => {
    const arr: number[] = []
    let acc = 0
    for (let i = 0; i < ayatList.length; i++) {
      arr.push(acc)
      acc += ayatList[i]?.audioDurationMs || liveDurations[i] || 0
    }
    return arr
  }, [ayatList, liveDurations])

  const playAyat = useCallback(
    (idx: number) => {
      if (!ayatList[idx]) return
      const audio = audioRef.current
      if (!audio) return
      autoAdvancedAyatRef.current = null
      setCurrentIndex(idx)
      setCurrentTimeMs(0)
      audio.src = ayatList[idx]!.audioUrl
      audio.volume = volume
      audio.muted = muted
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false)
      })
    },
    [ayatList, volume, muted],
  )

  useEffect(() => {
    if (!isPlaying) return
    let cancelled = false

    const tick = () => {
      if (cancelled) return
      const audio = audioRef.current
      const currentAyat = ayatList[currentIndex]

      if (audio && currentAyat) {
        const tMs = audio.currentTime * 1000
        setCurrentTimeMs(tMs)

        const advanceAtMs = getAdvanceAtMs(currentAyat, liveDurations[currentIndex] || 0)
        if (
          currentIndex < ayatList.length - 1 &&
          advanceAtMs > 0 &&
          tMs >= advanceAtMs &&
          autoAdvancedAyatRef.current !== currentIndex
        ) {
          autoAdvancedAyatRef.current = currentIndex
          playAyat(currentIndex + 1)
          return
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, ayatList, currentIndex, liveDurations, playAyat])

  useEffect(() => {
    if (!ayatList.length) return
    const nextIdx = currentIndex + 1
    if (nextIdx >= ayatList.length) return
    const nextUrl = ayatList[nextIdx]?.audioUrl
    if (!nextUrl) return

    if (!nextAudioRef.current) {
      nextAudioRef.current = new Audio()
    }

    const nextAudio = nextAudioRef.current
    if (nextAudio.src !== nextUrl) {
      nextAudio.src = nextUrl
      nextAudio.preload = 'auto'
      nextAudio.muted = true
      nextAudio.volume = 0
      nextAudio.play().then(() => {
        nextAudio.pause()
        nextAudio.currentTime = 0
        nextAudio.muted = false
        nextAudio.volume = 1
      }).catch(() => {
        nextAudio.muted = false
        nextAudio.volume = 1
      })
    }
  }, [currentIndex, ayatList])

  useEffect(() => {
    return () => {
      if (nextAudioRef.current) {
        nextAudioRef.current.src = ''
        nextAudioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onEnded = () => {
      if (currentIndex < ayatList.length - 1) {
        playAyat(currentIndex + 1)
      } else {
        setIsPlaying(false)
        const lastAyat = ayatList[currentIndex]
        const lastDur = lastAyat?.audioDurationMs || liveDurations[currentIndex] || 0
        setCurrentTimeMs(lastDur)
      }
    }

    const onMeta = () => {
      const d = audio.duration
      if (isFinite(d) && d > 0) {
        setLiveDurations((prev) => {
          if (prev[currentIndex] === d * 1000) return prev
          return { ...prev, [currentIndex]: d * 1000 }
        })
      }
    }

    audio.addEventListener('ended', onEnded)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)

    return () => {
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
    }
  }, [currentIndex, ayatList, playAyat])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !ayatList.length) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    if (!audio.src || audio.src === window.location.href) {
      playAyat(currentIndex)
      return
    }

    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }

  const onSeek = (v: number[]) => {
    const target = v[0]!
    let idx = 0
    for (let i = 0; i < offsets.length; i++) {
      const start = offsets[i]!
      const end = start + (ayatList[i]?.audioDurationMs || liveDurations[i] || 0)
      if (target >= start && target < end) {
        idx = i
        break
      }
      if (i === offsets.length - 1) idx = i
    }

    const into = target - (offsets[idx] || 0)
    if (idx !== currentIndex) {
      autoAdvancedAyatRef.current = null
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

  const prevListRef = useRef(ayatList)
  useEffect(() => {
    if (prevListRef.current === ayatList) return
    prevListRef.current = ayatList
    setCurrentIndex(0)
    setIsPlaying(false)
    autoAdvancedAyatRef.current = null
    setCurrentTimeMs(0)
    setLiveDurations({})
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
    }
  }, [ayatList])

  useEffect(() => {
    if (!ayatList.length) return
    const probes: HTMLAudioElement[] = []
    ayatList.forEach((ayat, i) => {
      if (ayat.audioDurationMs > 0) return
      const a = new Audio()
      a.preload = 'metadata'
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
      probes.forEach((a) => {
        a.src = ''
      })
    }
  }, [ayatList])

  const overlayBg = overlayCssBackground(settings)
  const isVideoBg = settings.backgroundImage.endsWith('.mp4')

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
      <audio ref={audioRef} preload="auto" />

      <div className="flex-1 min-h-0 grid place-items-center p-3 sm:p-6">
        <div
          className="qv-smooth relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
          style={{
            aspectRatio: aspect.ratio,
            ...(settings.orientation === 'portrait'
              ? { height: '100%', width: 'auto', maxWidth: '100%' }
              : { width: '100%', maxHeight: '100%', height: 'auto' }),
            containerType: 'inline-size',
            backgroundImage: isVideoBg ? undefined : `url(${settings.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: isVideoBg ? '#0a0a14' : undefined,
          }}
        >
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

          {overlayBg && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: overlayBg }}
            />
          )}

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.30) 100%)',
            }}
          />

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
                  {buildArabicTokens(current.arabicText).map((tok, i) => (
                    <span
                      key={i}
                      className="qv-smooth inline-block mx-[1px]"
                      style={{
                        color: settings.fontColor,
                        textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                      }}
                    >
                      {tok}
                    </span>
                  ))}
                </div>

                {settings.showTranslation &&
                  settings.showTransliteration &&
                  current.arabicText && (
                    <div
                      className="my-2 h-px opacity-40"
                      style={{ backgroundColor: settings.fontColor, width: '12cqw' }}
                    />
                  )}

                {settings.showTransliteration && current.transliteration && (
                  <div
                    className="qv-smooth text-center italic text-white/70 leading-snug"
                    style={{ fontSize: '2.4cqw', maxWidth: '80cqw' }}
                  >
                    {current.transliteration}
                  </div>
                )}

                {settings.showTranslation && (
                  <p
                    className={`qv-smooth text-white/85 mx-auto leading-snug drop-shadow text-center ${isBengaliTranslation ? (BENGALI_FONT_CLASS[settings.bengaliFont] ?? 'font-bengali-sans') : ''}`}
                    style={{
                      fontSize: translationFontSizeCss,
                      marginTop: TEXT_SPACING_MAP[settings.textSpacing],
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
                      to preview the recitation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

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
              {ayatList.length > 0 && <div>Recited by {reciter.name}</div>}
            </div>
          )}

          <Image
            src="/watermark.png"
            alt=""
            aria-hidden
            width={200}
            height={56}
            sizes="14cqw"
            className="absolute pointer-events-none select-none h-[14cqw] w-auto"
            style={{
              top: '4cqw',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: 0.9,
              filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))',
            }}
          />
        </div>
      </div>

      <div className="border-t border-border bg-card px-3 sm:px-5 py-2.5 sm:py-3 space-y-2">
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

          <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
            <Slider
              value={[Math.min(totalMs, (offsets[currentIndex] || 0) + currentTimeMs)]}
              max={Math.max(1, totalMs)}
              step={100}
              onValueChange={onSeek}
              disabled={!ayatList.length}
              className="flex-1 min-w-0"
            />
            <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap tabular-nums shrink-0">
              {formatMs((offsets[currentIndex] || 0) + currentTimeMs)} / {formatMs(totalMs)}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-muted"
              onClick={() => setMuted((m) => !m)}
              title={muted ? 'Unmute' : 'Mute'}
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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
            {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

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
