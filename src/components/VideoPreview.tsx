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
  Settings,
} from 'lucide-react'
import { Player, PlayerRef } from '@remotion/player'
import { AyatVideo } from '@/remotion/AyatVideo'
import { useBuilderStore } from '@/lib/store'
import { RECITERS as RECITERS_LIST } from '@/lib/reciters'
import { videoAttributionLine } from '@/lib/translations'
import { Slider } from '@/components/ui/slider'
import { getAdvanceAtMs } from '@/lib/advanceTiming'
import { formatMs } from '@/lib/format'

const ASPECT: Record<string, { w: number; h: number; ratio: string }> = {
  landscape: { w: 1280, h: 720, ratio: '16 / 9' },
  portrait: { w: 720, h: 1280, ratio: '9 / 16' },
}

const FPS = 30

export function VideoPreview({ onSettingsClick }: { onSettingsClick?: () => void }) {
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

  const playerRef = useRef<PlayerRef>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [volume, setVolume] = useState(0.9)
  const [muted, setMuted] = useState(false)

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000)
  }, [])

  const revealControls = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }, [])

  // Track player readiness so the event-listener effect can react to mounts
  // and unmounts of the <Player> (which is conditionally rendered).
  const [playerReady, setPlayerReady] = useState(false)

  // Stable callback ref — only triggers on mount/unmount, never on re-render,
  // avoiding the "maximum update depth" loop.
  const handlePlayerRef = useCallback((p: PlayerRef | null) => {
    playerRef.current = p
    setPlayerReady(p !== null)
  }, [])

  // Register event listeners when the Player mounts; deregister on unmount.
  useEffect(() => {
    const player = playerRef.current
    if (!player || !playerReady) return

    const onFrame = () => {
      const p = playerRef.current
      if (p) setCurrentFrame(p.getCurrentFrame())
    }
    const onPlay = () => { setIsPlaying(true); scheduleHide() }
    const onPause = () => {
      setIsPlaying(false)
      setShowControls(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
    const onEnded = () => {
      setIsPlaying(false)
      setShowControls(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }

    player.addEventListener('frameupdate', onFrame)
    player.addEventListener('play', onPlay)
    player.addEventListener('pause', onPause)
    player.addEventListener('ended', onEnded)

    return () => {
      player.removeEventListener('frameupdate', onFrame)
      player.removeEventListener('play', onPlay)
      player.removeEventListener('pause', onPause)
      player.removeEventListener('ended', onEnded)
    }
  }, [playerReady, scheduleHide])

  const attributionLine = useMemo(
    () => videoAttributionLine(translationKey),
    [translationKey],
  )

  const aspect = ASPECT[settings.orientation]

  const frameOffsets = useMemo(() => {
    const arr: number[] = []
    let acc = 0
    for (const a of ayatList) {
      arr.push(acc)
      const advanceMs = getAdvanceAtMs(a, a.audioDurationMs)
      acc += Math.round(advanceMs / 1000 * FPS)
    }
    return arr
  }, [ayatList])

  const totalFrames = useMemo(() => {
    if (frameOffsets.length === 0) return 0
    const last = frameOffsets[frameOffsets.length - 1]!
    const lastSlide = ayatList[ayatList.length - 1]
    const lastAdvance = getAdvanceAtMs(lastSlide, lastSlide?.audioDurationMs ?? 0)
    return last + Math.round(lastAdvance / 1000 * FPS)
  }, [frameOffsets, ayatList])

  const currentIndex = useMemo(() => {
    for (let i = frameOffsets.length - 1; i >= 0; i--) {
      if (currentFrame >= frameOffsets[i]!) return i
    }
    return 0
  }, [currentFrame, frameOffsets])

  const current = ayatList[currentIndex]
  const currentMs = (currentFrame / FPS) * 1000
  const totalMs = totalFrames / FPS * 1000

  useEffect(() => {
    const player = playerRef.current
    if (!ayatList.length) {
      player?.pause()
      setIsPlaying(false)
      setCurrentFrame(0)
      return
    }
    player?.pause()
    setCurrentFrame(0)
  }, [ayatList])

  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    player.setVolume(muted ? 0 : volume)
  }, [volume, muted])

  const togglePlay = useCallback(() => {
    const p = playerRef.current
    if (!p || !ayatList.length) return
    if (isPlaying) {
      p.pause()
    } else {
      p.play()
    }
  }, [isPlaying, ayatList.length])

  const handleTapOverlay = useCallback(() => {
    togglePlay()
  }, [togglePlay])

  const onSeek = (ms: number) => {
    const p = playerRef.current
    if (!p) return
    const frame = Math.round(ms / 1000 * FPS)
    p.seekTo(Math.min(frame, totalFrames - 1))
  }

  const playAyat = (idx: number) => {
    const p = playerRef.current
    if (!p) return
    const frame = frameOffsets[idx]
    if (frame !== undefined) {
      p.seekTo(frame)
      p.play()
    }
  }

  const inputProps = useMemo(() => ({
    slides: ayatList,
    settings,
    orientation: settings.orientation,
    reciterName: reciter?.name ?? '',
    attributionLine,
    surahName: surah?.name ?? '',
    surahNameArabic: surah?.arabicName ?? '',
    totalAyats: ayatList.length,
  }), [ayatList, settings, reciter, attributionLine, surah])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 grid place-items-center p-3 sm:p-6">
        <div
          className="qv-smooth relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
          style={{
            aspectRatio: aspect.ratio,
            ...(settings.orientation === 'portrait'
              ? { height: '100%', width: 'auto', maxWidth: '100%' }
              : { width: '100%', maxHeight: '100%', height: 'auto' }),
          }}
        >
          {ayatList.length > 0 ? (
            <Player
              ref={handlePlayerRef}
              component={AyatVideo}
              durationInFrames={totalFrames}
              compositionWidth={aspect.w}
              compositionHeight={aspect.h}
              fps={FPS}
              inputProps={inputProps}
              controls={false}
              showVolumeControls={false}
              style={{ width: '100%', height: '100%' }}
              renderLoading={() => (
                <div className="absolute inset-0 grid place-items-center bg-[#0a0f1a]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-center text-white/70 px-6 bg-[#0a0f1a]">
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

          {/* Controls overlay */}
          <div
            className="absolute inset-0 z-10"
            onMouseEnter={revealControls}
            onMouseMove={revealControls}
            onMouseLeave={() => { if (isPlaying) scheduleHide() }}
          >
            <div className="absolute inset-0" onClick={handleTapOverlay} />

            <div className={`absolute inset-0 grid place-items-center transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              <button
                type="button"
                  onClick={(e) => { e.stopPropagation(); togglePlay() }}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors pointer-events-auto"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 sm:h-7 sm:w-7" />
                ) : (
                  <Play className="h-6 w-6 sm:h-7 sm:w-7 ml-0.5" />
                )}
              </button>
            </div>

            <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 sm:px-4 transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); playAyat(Math.max(0, currentIndex - 1)) }}
                disabled={!ayatList.length}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30 pointer-events-auto"
              >
                <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); playAyat(Math.min(ayatList.length - 1, currentIndex + 1)) }}
                disabled={!ayatList.length || currentIndex >= ayatList.length - 1}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30 pointer-events-auto"
              >
                <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className={`absolute bottom-0 inset-x-0 transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              <div className="bg-gradient-to-t from-black/60 to-transparent pb-1.5 pt-5 px-3 sm:px-4">
                <div className="flex items-center justify-end mb-5">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onSettingsClick?.() }}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-sm font-semibold text-white hover:bg-white/25 transition-colors pointer-events-auto shadow-lg"
                  >
                    <Settings className="h-4 w-4" />
                    Customize
                  </button>
                </div>
                <Slider
                  value={[Math.min(totalMs, currentMs)]}
                  max={Math.max(1, totalMs)}
                  step={100}
                  onValueChange={(v) => { onSeek(v[0]!); revealControls() }}
                  disabled={!ayatList.length}
                  className="pointer-events-auto mb-1.5"
                />
                <div className="flex items-center justify-between">
                  <span className="text-white/90 text-[11px] font-mono tabular-nums">
                    {formatMs(currentMs)} / {formatMs(totalMs)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setMuted((m) => !m) }}
                    className="text-white/80 hover:text-white transition-colors pointer-events-auto"
                  >
                    {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Thin seek bar - always visible */}
            <div
              className="absolute bottom-0 inset-x-0 h-1 cursor-pointer z-20"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const pct = Math.max(0, Math.min(1, x / rect.width))
                  onSeek(pct * totalMs)
                  revealControls()
                }}
            >
              <div className="h-full bg-white/20">
                <div
                  className="h-full bg-white/80 hover:bg-white transition-colors"
                  style={{ width: `${totalMs > 0 ? currentMs / totalMs * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


