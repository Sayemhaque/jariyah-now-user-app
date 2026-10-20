import React from 'react'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

const brace = (x: number, top: number, bottom: number) => {
  const mid = (top + bottom) / 2
  return `M${x + 34} ${top} Q${x} ${top} ${x} ${top + 60} V${mid - 60} Q${x} ${mid} ${x - 38} ${mid} Q${x} ${mid} ${x} ${mid + 60} V${bottom - 60} Q${x} ${bottom} ${x + 34} ${bottom}`
}

export const BracketLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [top, bottom] = [h * pick(p.format, 0.3, 0.28, 0.3), h * pick(p.format, 0.8, 0.82, 0.76)]
  const x = 112
  const side = (
    <g fill="none" stroke={t.accent} strokeLinecap="round">
      <path d={brace(x, top, bottom)} strokeWidth="3" />
      <path d={brace(x + 14, top + 14, bottom - 14)} strokeWidth="0.9" opacity="0.6" />
      <rect x={x - 46} y={(top + bottom) / 2 - 8} width="16" height="16" transform={`rotate(45 ${x - 38} ${(top + bottom) / 2})`} fill={t.accent} />
      <circle cx={x + 38} cy={top} r="5" fill={t.accent} />
      <circle cx={x + 38} cy={bottom} r="5" fill={t.accent} />
    </g>
  )
  return (
    <OrnamentLayout
      {...p}
      padding={pick(p.format, '110px 190px 100px', '92px 190px 86px', '270px 190px 290px')}
      art={
        <>
          {side}
          <g transform={`translate(${w} 0) scale(-1 1)`}>{side}</g>
        </>
      }
    />
  )
}
