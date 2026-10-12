import React from 'react'
import { useVideoConfig } from 'remotion'
import { defaultScene, sceneUrl } from '@/lib/backgroundPresets'
import { defaultVideoSettings } from '@/lib/defaultSettings'
import { SceneBackground } from './scene/SceneBackground'

export const ScenePreview: React.FC<{ sceneKey?: string }> = ({ sceneKey = defaultScene.key }) => {
  const { width, height } = useVideoConfig()
  const settings = { ...defaultVideoSettings, backgroundPreset: sceneKey, backgroundImage: sceneUrl(sceneKey) }
  return <SceneBackground settings={settings} width={width} height={height} />
}
