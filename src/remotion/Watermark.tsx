import React from 'react'
import { Img, staticFile } from 'remotion'
import { useReelLayout } from './reelLayout'

export const Watermark: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const { logoTop, logoHeight } = useReelLayout()

  return (
    <Img
      src={staticFile('/watermark.png')}
      style={{
        position: 'absolute',
        top: height * logoTop,
        left: '50%',
        transform: 'translateX(-50%)',
        height: height * logoHeight,
        width: 'auto',
        opacity: 0.95,
        pointerEvents: 'none',
      }}
    />
  )
}
