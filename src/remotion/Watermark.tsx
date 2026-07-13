import React from 'react'
import { Img, staticFile } from 'remotion'

export const Watermark: React.FC<{
  width: number
  height: number
}> = ({ width, height }) => {
  const targetH = Math.round((Math.min(width, height) / 720) * 112)

  return (
    <Img
      src={staticFile('/watermark.png')}
      style={{
        position: 'absolute',
        top: height * 0.04,
        left: '50%',
        transform: 'translateX(-50%)',
        height: targetH,
        width: 'auto',
        opacity: 0.9,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))',
      }}
    />
  )
}
