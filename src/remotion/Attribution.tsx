import React from 'react'
import { withAlpha } from '@/lib/color'
import { uiFontStack } from './fontStacks'
import { useReelLayout } from './reelLayout'

interface AttributionProps {
  attributionLine: string
  color: string
  width: number
  height: number
}

export const Attribution: React.FC<AttributionProps> = ({ attributionLine, color, width, height }) => {
  const layout = useReelLayout()
  if (!attributionLine) return null
  return (
    <div
      style={{
        position: 'absolute',
        bottom: height * layout.attributionBottom,
        left: width * layout.progressInset,
        right: width * layout.progressInset,
        textAlign: 'center',
        color: withAlpha(color, 0.5),
        fontFamily: uiFontStack,
        fontSize: Math.min(width, height) * 0.019,
        lineHeight: 1.3,
        pointerEvents: 'none',
      }}
    >
      {attributionLine}
    </div>
  )
}
