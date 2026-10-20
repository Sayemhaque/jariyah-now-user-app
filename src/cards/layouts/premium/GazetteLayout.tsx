import React from 'react'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

function Rules({ y, width, dir, color }: { y: number; width: number; dir: 1 | -1; color: string }) {
  return (
    <g fill={color}>
      <rect x="80" y={y} width={width - 160} height="2" />
      <rect x="80" y={y + dir * 9 - (dir < 0 ? 5 : 0)} width={width - 160} height="5" />
      <rect x="80" y={y + dir * 22} width={width - 160} height="1" opacity="0.6" />
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={width / 2 + (i - 4) * 26} cy={y + dir * 34} r={i === 4 ? 4 : 2} opacity="0.8" />)}
    </g>
  )
}

export const GazetteLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const top = pick(p.format, 50, 40, 210)
  const bottom = h - top
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={`${top + pick(p.format, 74, 56, 96)}px 140px ${h - bottom + pick(p.format, 70, 52, 90)}px`}
      gap={pick(p.format, 28, 20, 36)}
      art={
        <>
          <Rules y={top} width={w} dir={1} color={t.accent} />
          <Rules y={bottom} width={w} dir={-1} color={t.accent} />
          {[80, w - 80].map((x) => <rect key={x} x={x} y={top + 50} width="1" height={bottom - top - 100} fill={t.accent} opacity="0.45" />)}
        </>
      }
    />
  )
}
