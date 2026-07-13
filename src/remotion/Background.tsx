import React from 'react'
import { Img, Video, OffthreadVideo, Loop, useVideoConfig } from 'remotion'
import { normalizeBackgroundVideoUrl } from '@/lib/backgroundPresets'

function isVideoUrl(url: string): boolean {
  return url.endsWith('.mp4')
}

export const Background: React.FC<{ url: string; isExport?: boolean; preLooped?: boolean }> = ({
  url,
  isExport = false,
  preLooped = false,
}) => {
  const { durationInFrames } = useVideoConfig()
  const normalizedUrl = normalizeBackgroundVideoUrl(url)

  if (isVideoUrl(normalizedUrl)) {
    if (isExport && preLooped) {
      return (
        <OffthreadVideo
          src={normalizedUrl}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          muted
        />
      )
    }

    if (isExport) {
      return (
        <Loop durationInFrames={durationInFrames}>
          <OffthreadVideo
            src={normalizedUrl}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            muted
          />
        </Loop>
      )
    }

    return (
      <Video
        src={normalizedUrl}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        muted
        loop
      />
    )
  }

  return (
    <Img
      src={normalizedUrl}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  )
}
