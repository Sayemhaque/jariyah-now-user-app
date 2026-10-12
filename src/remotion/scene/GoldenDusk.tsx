import React from 'react'
import { useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { MosqueSilhouette } from './MosqueSilhouette'
import { SoftClouds } from './SoftClouds'

export const GoldenDusk: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const { width, height } = useVideoConfig()
  const sunSize = Math.min(width, height) * 0.9

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: width / 2 - sunSize / 2,
          top: height * 0.78 - sunSize / 2,
          width: sunSize,
          height: sunSize,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,214,150,0.85) 0%, rgba(255,150,90,0.35) 30%, rgba(255,120,80,0) 65%)',
        }}
      />
      <SoftClouds color="#ffc9a8" top={0.18} bottom={0.62} opacity={0.4} />
      <MosqueSilhouette color="#0c0816" light={palette.accent} />
    </>
  )
}
