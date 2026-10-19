import React from 'react'
import { useVideoConfig } from 'remotion'

export const FilmGrain: React.FC<{ opacity: number }> = ({ opacity }) => {
  const { width, height } = useVideoConfig()
  const dot = Math.max(2, Math.round(Math.min(width, height) / 360))
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        backgroundImage: 'radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px), radial-gradient(rgba(0,0,0,.6) 1px, transparent 1px)',
        backgroundSize: `${dot * 3}px ${dot * 3}px, ${dot * 5}px ${dot * 5}px`,
        backgroundPosition: `0 0, ${dot}px ${dot * 2}px`,
      }}
    />
  )
}
