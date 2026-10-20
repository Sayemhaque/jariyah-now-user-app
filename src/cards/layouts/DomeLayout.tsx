import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, panelFill, storyInset, type LayoutProps } from './layoutTypes'

function domePath(l: number, r: number, top: number, shoulder: number, bottom: number): string {
  const cx = (l + r) / 2
  const h = shoulder - top
  const bulge = 26
  return `M${l} ${bottom} V${shoulder} C${l - bulge} ${shoulder - h * 0.28} ${l - bulge * 0.4} ${shoulder - h * 0.62} ${cx - (cx - l) * 0.42} ${top + h * 0.3} C${cx - 40} ${top + h * 0.16} ${cx - 8} ${top + h * 0.1} ${cx} ${top} C${cx + 8} ${top + h * 0.1} ${cx + 40} ${top + h * 0.16} ${cx + (r - cx) * 0.42} ${top + h * 0.3} C${r + bulge * 0.4} ${shoulder - h * 0.62} ${r + bulge} ${shoulder - h * 0.28} ${r} ${shoulder} V${bottom} Z`
}

export const DomeLayout: React.FC<LayoutProps> = (p) => {
  const { width, height, theme } = p
  const square = p.format === 'square'
  const top = storyInset(p.format, 250, square ? 66 : 92)
  const shoulder = top + storyInset(p.format, 330, square ? 170 : 260)
  const bottom = height - storyInset(p.format, 220, square ? 50 : 64)
  const [l, r] = [104, width - 104]
  const cx = width / 2
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <path d={domePath(l, r, top, shoulder, bottom)} fill={panelFill(theme)} stroke={theme.accent} strokeWidth="2.2" />
        <path d={domePath(l + 16, r - 16, top + 24, shoulder + 8, bottom - 16)} fill="none" stroke={theme.accent} strokeWidth="0.9" opacity="0.6" />
        <line x1={cx} y1={top} x2={cx} y2={top - 30} stroke={theme.accent} strokeWidth="2" />
        <circle cx={cx} cy={top - 14} r="4.5" fill={theme.accent} />
        <path d={`M${cx + 6} ${top - 52} a14 14 0 1 0 0 22 a11 11 0 1 1 0 -22 Z`} fill={theme.accent} />
      </svg>
      <div style={column(`${shoulder - (square ? 70 : 100)}px 150px ${height - bottom + (square ? 40 : 60)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
