import React from 'react'
import { Img, staticFile } from 'remotion'
import { useReelLayout } from './reelLayout'

export const Watermark: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const { watermark } = useReelLayout()
  const targetH = Math.round((Math.min(width, height) / 720) * 52)

  return (
    <Img
      src={staticFile('/watermark.png')}
      style={{
        position: 'absolute',
        top: height * watermark.top,
        ...(watermark.left !== undefined ? { left: width * watermark.left } : { right: width * (watermark.right ?? 0.04) }),
        height: targetH,
        width: 'auto',
        opacity: 0.9,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))',
      }}
    />
  )
}
