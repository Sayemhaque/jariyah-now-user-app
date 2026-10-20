import React from 'react'
import { cardPadding } from '@/lib/cards/cardTypography'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, type LayoutProps } from './layoutTypes'

const crescent = (cx: number, cy: number, r: number) => `M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} A${r * 0.62} ${r} 0 0 1 ${cx} ${cy - r} Z`
const star = (x: number, y: number, s: number) => `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`
const stars = [[0.08, 0.06, 11], [0.17, 0.15, 6], [0.9, 0.05, 8], [0.06, 0.27, 5], [0.94, 0.33, 6], [0.84, 0.18, 4]]

export const CrescentLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const pad = cardPadding[p.format]
  const square = p.format === 'square'
  const r = width * (square ? 0.36 : 0.42)
  const [cx, cy] = [width * 0.6, Math.min(height * 0.28, r + 60)]
  const moon = crescent(cx, cy, r)
  const rotate = `rotate(-24 ${cx} ${cy})`
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, filter: 'blur(26px)' }}>
        <path d={moon} transform={rotate} fill={theme.accent} opacity={theme.light ? 0.14 : 0.2} />
      </svg>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <path d={moon} transform={rotate} fill={theme.accent} opacity={theme.light ? 0.08 : 0.1} />
        <path d={moon} transform={rotate} fill="none" stroke={theme.accent} strokeWidth="1.2" opacity={theme.light ? 0.3 : 0.36} />
        {stars.map(([x, y, s], i) => (
          <path key={i} d={star(x * width, y * height, s)} fill={theme.light ? theme.accent : theme.arabic} opacity={0.4 + (s / 11) * 0.4} />
        ))}
      </svg>
      <div style={column(`${pad.top + (square ? 0 : 16)}px 136px ${pad.bottom}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
