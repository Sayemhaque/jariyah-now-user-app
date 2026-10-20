import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, panelFill, storyInset, type LayoutProps } from './layoutTypes'

function ogeePath(l: number, r: number, top: number, shoulder: number, bottom: number): string {
  const cx = (l + r) / 2
  const hw = (r - l) / 2
  const h = shoulder - top
  const mid = top + h * 0.48
  return `M${l} ${bottom} V${shoulder} C${l} ${shoulder - h * 0.36} ${cx - hw * 0.72} ${mid + h * 0.08} ${cx - hw * 0.42} ${mid} C${cx - hw * 0.14} ${mid - h * 0.08} ${cx - 6} ${top + h * 0.2} ${cx} ${top} C${cx + 6} ${top + h * 0.2} ${cx + hw * 0.14} ${mid - h * 0.08} ${cx + hw * 0.42} ${mid} C${cx + hw * 0.72} ${mid + h * 0.08} ${r} ${shoulder - h * 0.36} ${r} ${shoulder} V${bottom} Z`
}

export const OgeeLayout: React.FC<LayoutProps> = (p) => {
  const { width, height, theme } = p
  const square = p.format === 'square'
  const top = storyInset(p.format, 230, square ? 64 : 84)
  const shoulder = top + storyInset(p.format, 320, square ? 170 : 250)
  const bottom = height - storyInset(p.format, 220, square ? 50 : 64)
  const [l, r] = [90, width - 90]
  const cx = width / 2
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <path d={ogeePath(l, r, top, shoulder, bottom)} fill={panelFill(theme)} stroke={theme.accent} strokeWidth="2.2" />
        <path d={ogeePath(l + 16, r - 16, top + 30, shoulder + 6, bottom - 16)} fill="none" stroke={theme.accent} strokeWidth="0.9" opacity="0.6" />
        <line x1={cx} y1={top} x2={cx} y2={top - 22} stroke={theme.accent} strokeWidth="1.6" />
        <rect x={cx - 7} y={top - 36} width="14" height="14" fill={theme.accent} transform={`rotate(45 ${cx} ${top - 29})`} />
        <circle cx={cx} cy={top - 48} r="3" fill={theme.accent} />
      </svg>
      <div style={column(`${shoulder - (square ? 66 : 96)}px 150px ${height - bottom + (square ? 40 : 60)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
