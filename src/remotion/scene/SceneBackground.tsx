import React from 'react'
import { AbsoluteFill } from 'remotion'
import { defaultScene, getScene, sceneForUrl } from '@/lib/backgroundPresets'
import type { VideoSettings } from '@/lib/types'
import { OverlayLayer } from '../OverlayLayer'
import { DustParticles } from './DustParticles'
import { ImageBackground } from './ImageBackground'
import { SceneMotif } from './SceneMotif'

interface SceneBackgroundProps {
  settings: VideoSettings
  width: number
  height: number
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ settings, width, height }) => {
  const scene = getScene(settings.backgroundPreset) ?? sceneForUrl(settings.backgroundImage)
  const isImage = !scene && settings.backgroundImage && !settings.backgroundImage.startsWith('scene:')
  const palette = scene?.palette ?? settings.backgroundPalette ?? defaultScene.palette
  const [top, middle, bottom] = palette.base

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${middle} 48%, ${bottom} 100%)`, overflow: 'hidden' }}>
      {isImage ? <ImageBackground src={settings.backgroundImage} palette={palette} /> : <SceneMotif scene={scene ?? defaultScene} />}
      {isImage && (
        <OverlayLayer
          style={settings.overlayStyle}
          color={settings.overlayColor}
          opacity={settings.overlayOpacity}
          width={width}
          height={height}
        />
      )}
      <DustParticles color={palette.accent} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)' }} />
    </AbsoluteFill>
  )
}
