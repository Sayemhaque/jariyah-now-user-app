import React from 'react'
import { petalPath, starPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, tint, type LayoutProps } from '../layoutTypes'

function Thumbpiece({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path d={starPath(x, y, 16, 38, 29)} fill={tint(color, 0.22)} stroke={color} strokeWidth="1.2" />
      <path d={petalPath(x, y, 8, 6, 24)} fill={color} opacity="0.85" />
      <circle cx={x} cy={y} r="5" fill={color} />
    </g>
  )
}

export const ShamsaLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [cx, cy] = [w / 2, h / 2]
  const r = pick(p.format, 470, 420, 500)
  const m = pick(p.format, 54, 46, 64)
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '124px 150px 116px', '100px 150px 92px', '280px 150px 300px')}
      gap={pick(p.format, 30, 22, 36)}
      art={
        <>
          <g fill="none" stroke={t.accent} opacity={t.light ? 0.26 : 0.2}>
            <path d={starPath(cx, cy, 32, r, r * 0.86)} strokeWidth="1.4" />
            <path d={petalPath(cx, cy, 16, r * 0.52, r * 0.82)} strokeWidth="1.2" />
            <circle cx={cx} cy={cy} r={r * 0.52} strokeWidth="2" />
            <circle cx={cx} cy={cy} r={r * 0.47} strokeWidth="1" strokeDasharray="2 7" />
          </g>
          <rect x={m} y={m} width={w - 2 * m} height={h - 2 * m} fill="none" stroke={t.accent} strokeWidth="1.8" opacity="0.75" />
          <rect x={m + 11} y={m + 11} width={w - 2 * m - 22} height={h - 2 * m - 22} fill="none" stroke={t.accent} strokeWidth="0.8" opacity="0.5" />
          <Thumbpiece x={m} y={cy} color={t.accent} />
          <Thumbpiece x={w - m} y={cy} color={t.accent} />
        </>
      }
    />
  )
}
