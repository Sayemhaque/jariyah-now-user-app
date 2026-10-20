import React from 'react'
import { CardCorner } from './CardOrnament'

export const CardFrame: React.FC<{ color: string; width: number; height: number }> = ({ color, width, height }) => {
  const outer = 44
  const inner = 58
  return (
    <>
      <div style={{ position: 'absolute', inset: outer, border: `1.5px solid ${color}`, opacity: 0.55 }} />
      <div style={{ position: 'absolute', inset: inner, border: `0.8px solid ${color}`, opacity: 0.3 }} />
      <CardCorner color={color} rotate={0} style={{ left: outer - 8, top: outer - 8 }} />
      <CardCorner color={color} rotate={90} style={{ left: width - outer - 66, top: outer - 8 }} />
      <CardCorner color={color} rotate={180} style={{ left: width - outer - 66, top: height - outer - 66 }} />
      <CardCorner color={color} rotate={270} style={{ left: outer - 8, top: height - outer - 66 }} />
    </>
  )
}
