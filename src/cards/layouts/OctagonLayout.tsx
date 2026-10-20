import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, panelFill, storyInset, type LayoutProps } from './layoutTypes'

function octagon(l: number, t: number, r: number, b: number, c: number): number[][] {
  return [[l + c, t], [r - c, t], [r, t + c], [r, b - c], [r - c, b], [l + c, b], [l, b - c], [l, t + c]]
}

const toPath = (pts: number[][]) => `M${pts.map((pt) => pt.join(' ')).join(' L')} Z`

export const OctagonLayout: React.FC<LayoutProps> = (p) => {
  const { width, height, theme } = p
  const square = p.format === 'square'
  const [l, r] = [72, width - 72]
  const t = storyInset(p.format, 220, square ? 56 : 72)
  const b = height - t
  const c = square ? 104 : 128
  const outer = octagon(l, t, r, b, c)
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <path d={toPath(outer)} fill={panelFill(theme)} stroke={theme.accent} strokeWidth="2.2" />
        <path d={toPath(octagon(l + 16, t + 16, r - 16, b - 16, c - 7))} fill="none" stroke={theme.accent} strokeWidth="0.9" opacity="0.6" />
        {outer.map(([x, y], i) => (
          <rect key={i} x={x - 7} y={y - 7} width="14" height="14" fill={theme.accent} transform={`rotate(45 ${x} ${y})`} />
        ))}
      </svg>
      <div style={column(`${t + (square ? 96 : 120)}px 150px ${height - b + (square ? 80 : 100)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
