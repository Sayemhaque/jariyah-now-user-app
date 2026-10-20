import React from 'react'
import { starPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { panelFill, pick, type LayoutProps } from '../layoutTypes'

export const LetterLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [x0, x1] = [80, w - 80]
  const top = pick(p.format, 60, 46, 220)
  const bottom = h - pick(p.format, 100, 84, 280)
  const edge = { x: x0, y: top, width: x1 - x0, height: bottom - top, fill: 'none' }
  const sealY = bottom
  const paper = t.light ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.88)'
  return (
    <OrnamentLayout
      {...p}
      padding={`${top + pick(p.format, 70, 50, 90)}px 150px ${h - bottom + 66}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <rect {...edge} fill={panelFill(t)} />
          <rect {...edge} stroke={t.accent} strokeWidth="9" strokeDasharray="26 26" />
          <rect {...edge} stroke={t.arabic} strokeWidth="9" strokeDasharray="26 26" strokeDashoffset="26" opacity="0.7" />
          <rect x={x0 + 20} y={top + 20} width={x1 - x0 - 40} height={bottom - top - 40} fill="none" stroke={t.accent} strokeWidth="0.8" opacity="0.6" />
          <circle cx={w / 2} cy={sealY} r="50" fill={t.accent} />
          <circle cx={w / 2} cy={sealY} r="38" fill="none" stroke={paper} strokeWidth="1.6" opacity="0.7" />
          <path d={starPath(w / 2, sealY, 8, 26, 12)} fill={paper} opacity="0.75" />
        </>
      }
    />
  )
}
