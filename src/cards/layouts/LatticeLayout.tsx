import React from 'react'
import { cardPadding } from '@/lib/cards/cardTypography'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, type LayoutProps } from './layoutTypes'

const cell = 30
const strip = 112

function latticePath(height: number): string {
  const r = cell / 2
  const ring = (x: number, y: number) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${cell} 0 a${r} ${r} 0 1 0 ${-cell} 0`
  const rows = Math.ceil(height / cell) + 1
  const cols = Math.ceil(strip / cell) + 1
  return Array.from({ length: rows * cols }, (_, i) => {
    const [x, y] = [(i % cols) * cell, Math.floor(i / cols) * cell]
    return `${ring(x, y)} ${ring(x + r, y + r)}`
  }).join(' ')
}

const Strip: React.FC<{ height: number; color: string; right: boolean; left: number }> = ({ height, color, right, left }) => (
  <div style={{ position: 'absolute', top: 0, left, width: strip, height, WebkitMaskImage: `linear-gradient(to ${right ? 'left' : 'right'}, #000 25%, transparent)`, maskImage: `linear-gradient(to ${right ? 'left' : 'right'}, #000 25%, transparent)` }}>
    <svg width={strip} height={height} style={{ display: 'block' }}>
      <path d={latticePath(height)} fill="none" stroke={color} strokeWidth="1.3" opacity="0.62" />
    </svg>
  </div>
)

export const LatticeLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const pad = cardPadding[p.format]
  const square = p.format === 'square'
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <Strip height={height} color={theme.accent} right={false} left={0} />
      <Strip height={height} color={theme.accent} right left={width - strip} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <line x1={strip + 6} y1={0} x2={strip + 6} y2={height} stroke={theme.accent} strokeWidth="1" opacity="0.4" />
        <line x1={width - strip - 6} y1={0} x2={width - strip - 6} y2={height} stroke={theme.accent} strokeWidth="1" opacity="0.4" />
      </svg>
      <div style={column(`${pad.top}px 156px ${pad.bottom}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
