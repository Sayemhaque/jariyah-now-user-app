'use client'

import { Player } from '@remotion/player'
import { AyatVideo } from '@/remotion/AyatVideo'
import { videoFps } from '@/lib/constants'
import { usePreviewPlayer } from '@/hooks/usePreviewPlayer'
import { usePreviewProps } from '@/hooks/usePreviewProps'
import { LoadingIndicator } from './preview/LoadingIndicator'
import { PlayerOverlay } from './preview/PlayerOverlay'
import { PreviewPlaceholder } from './preview/PreviewPlaceholder'

const frameToMs = (frame: number) => (frame / videoFps) * 1000

export function VideoPreview({ onSettingsClick }: { onSettingsClick?: () => void }) {
  const { slides, inputProps, totalFrames, frameOffsets, aspect } = usePreviewProps()
  const { attachPlayer, currentFrame, ...player } = usePreviewPlayer(slides, totalFrames, frameOffsets)
  const currentIndex = Math.max(0, frameOffsets.findLastIndex((offset) => currentFrame >= offset))
  const portrait = inputProps.orientation === 'portrait'

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 grid place-items-center p-3 sm:p-6">
        <div
          className="qv-smooth relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
          style={{
            aspectRatio: aspect.ratio,
            ...(portrait
              ? { height: '100%', width: 'auto', maxWidth: '100%' }
              : { width: '100%', maxHeight: '100%', height: 'auto' }),
          }}
        >
          {slides.length > 0 ? (
            <Player
              ref={attachPlayer}
              component={AyatVideo}
              durationInFrames={totalFrames}
              compositionWidth={aspect.w}
              compositionHeight={aspect.h}
              fps={videoFps}
              inputProps={inputProps}
              controls={false}
              showVolumeControls={false}
              style={{ width: '100%', height: '100%' }}
              renderLoading={LoadingIndicator}
              acknowledgeRemotionLicense
            />
          ) : (
            <PreviewPlaceholder />
          )}
          <PlayerOverlay
            player={player}
            slideCount={slides.length}
            currentIndex={currentIndex}
            currentMs={frameToMs(currentFrame)}
            totalMs={frameToMs(totalFrames)}
            onSettingsClick={onSettingsClick}
          />
        </div>
      </div>
    </div>
  )
}
