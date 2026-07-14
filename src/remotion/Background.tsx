import React from 'react'
import { Img, Video, OffthreadVideo, Loop, useVideoConfig, staticFile } from 'remotion'
import { normalizeBackgroundVideoUrl } from '@/lib/backgroundPresets'

function isVideoUrl(url: string): boolean {
  return url.endsWith('.mp4')
}

function resolveUrl(raw: string): string {
  const url = normalizeBackgroundVideoUrl(raw)
  if (url.startsWith('/backgrounds/')) return staticFile(url)
  return url
}

export const Background: React.FC<{ url: string; isExport?: boolean; preLooped?: boolean }> = ({
  url,
  isExport = false,
  preLooped = false,
}) => {
  const { durationInFrames } = useVideoConfig()
  const src = resolveUrl(url)

  if (isVideoUrl(src)) {
    if (isExport && preLooped) {
      return (
        <OffthreadVideo
          src={src}
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
            src={src}
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
        src={src}
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
      src={src}
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
