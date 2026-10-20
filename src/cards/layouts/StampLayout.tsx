import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, panelFill, storyInset, type LayoutProps } from './layoutTypes'

const notch = 9
const spacing = 34

function edge(x0: number, y0: number, x1: number, y1: number): string {
  const len = Math.hypot(x1 - x0, y1 - y0)
  const [ux, uy] = [(x1 - x0) / len, (y1 - y0) / len]
  const n = Math.floor(len / spacing)
  const step = len / n
  return Array.from({ length: n }, (_, i) => {
    const c = step * (i + 0.5)
    return `L${x0 + ux * (c - notch)} ${y0 + uy * (c - notch)} A${notch} ${notch} 0 0 0 ${x0 + ux * (c + notch)} ${y0 + uy * (c + notch)}`
  }).join(' ') + ` L${x1} ${y1}`
}

const stampPath = (l: number, t: number, r: number, b: number) => `M${l} ${t} ${edge(l, t, r, t)} ${edge(r, t, r, b)} ${edge(r, b, l, b)} ${edge(l, b, l, t)} Z`

export const StampLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const square = p.format === 'square'
  const v = storyInset(p.format, 180, square ? 52 : 64)
  const [l, t, r, b] = [72, v, width - 72, height - v]
  const shadow = theme.light ? 'rgba(60, 40, 15, 0.22)' : 'rgba(0, 0, 0, 0.5)'
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, filter: `drop-shadow(0 18px 34px ${shadow})` }}>
        <path d={stampPath(l, t, r, b)} fill={theme.light ? 'rgba(255, 255, 255, 0.8)' : panelFill(theme)} />
      </svg>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <rect x={l + 28} y={t + 28} width={r - l - 56} height={b - t - 56} fill="none" stroke={theme.accent} strokeWidth="1.6" opacity="0.9" />
        <rect x={l + 36} y={t + 36} width={r - l - 72} height={b - t - 72} fill="none" stroke={theme.accent} strokeWidth="0.8" opacity="0.5" />
      </svg>
      <div style={column(`${t + (square ? 74 : 96)}px 140px ${height - b + (square ? 64 : 84)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
