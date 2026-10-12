import React from 'react'
import { Img, interpolate, Loop, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, Video } from 'remotion'
import { normalizeBackgroundVideoUrl, twilightMosqueUrls } from '@/lib/backgroundPresets'

const zoomRange = [1, 1.08]

function resolveUrl(raw: string): string {
  const url = normalizeBackgroundVideoUrl(raw)
  if (!url) return staticFile(twilightMosqueUrls.portrait)
  if (url.startsWith('/backgrounds/')) return staticFile(url)
  return url
}

interface BackgroundProps {
  url: string
  isExport?: boolean
  preLooped?: boolean
}

export const Background: React.FC<BackgroundProps> = ({ url, isExport = false, preLooped = false }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const src = resolveUrl(url)
  const zoom = interpolate(frame, [0, Math.max(1, durationInFrames)], zoomRange, { extrapolateRight: 'clamp' })
  const coverStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${zoom})`,
  }

  if (!src.endsWith('.mp4')) return <Img src={src} style={coverStyle} />
  if (!isExport) return <Video src={src} style={coverStyle} muted loop />

  const video = <OffthreadVideo src={src} style={coverStyle} muted />
  return preLooped ? video : <Loop durationInFrames={durationInFrames}>{video}</Loop>
}
