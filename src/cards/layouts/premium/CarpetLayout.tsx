import React from 'react'
import { perimeterPoints, starPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, tint, type LayoutProps } from '../layoutTypes'

export const CarpetLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const m = pick(p.format, 40, 34, 52)
  const band = 44
  const inner = m + band
  const mid = m + band / 2
  const beads = perimeterPoints(mid, mid, w - 2 * mid, h - 2 * mid, 34)
  const corners = [[m, m], [w - inner, m], [m, h - inner], [w - inner, h - inner]]
  return (
    <OrnamentLayout
      {...p}
      padding={pick(p.format, '140px 160px 128px', '118px 156px 104px', '300px 160px 320px')}
      gap={pick(p.format, 28, 20, 36)}
      art={
        <>
          <path d={`M${m} ${m} H${w - m} V${h - m} H${m} Z M${inner} ${inner} V${h - inner} H${w - inner} V${inner} Z`} fill={tint(t.accent, t.light ? 0.16 : 0.12)} fillRule="evenodd" />
          <rect x={m} y={m} width={w - 2 * m} height={h - 2 * m} fill="none" stroke={t.accent} strokeWidth="2.4" />
          <rect x={inner} y={inner} width={w - 2 * inner} height={h - 2 * inner} fill="none" stroke={t.accent} strokeWidth="2" />
          <rect x={inner + 12} y={inner + 12} width={w - 2 * inner - 24} height={h - 2 * inner - 24} fill="none" stroke={t.accent} strokeWidth="0.8" opacity="0.55" />
          {beads.map(([x, y], i) => (
            <rect key={i} x={x - 6} y={y - 6} width="12" height="12" transform={`rotate(45 ${x} ${y})`} fill={i % 2 ? 'none' : t.accent} stroke={t.accent} strokeWidth="1.1" opacity="0.8" />
          ))}
          {corners.map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width={band} height={band} fill={tint(t.accent, 0.3)} stroke={t.accent} strokeWidth="1.6" />
              <path d={starPath(x! + band / 2, y! + band / 2, 8, 17, 8)} fill={t.accent} />
            </g>
          ))}
        </>
      }
    />
  )
}
