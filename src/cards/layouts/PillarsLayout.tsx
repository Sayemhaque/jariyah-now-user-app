import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

function Pillar({ x, top, bottom, color, fill }: { x: number; top: number; bottom: number; color: string; fill: string }) {
  return (
    <g stroke={color} strokeWidth="1.4" fill={fill}>
      <path d={`M${x - 30} ${top} H${x + 30} L${x + 24} ${top + 12} H${x - 24} Z`} />
      <path d={`M${x - 22} ${top + 12} H${x + 22} Q${x + 18} ${top + 26} ${x + 17} ${top + 34} H${x - 17} Q${x - 18} ${top + 26} ${x - 22} ${top + 12} Z`} />
      <rect x={x - 17} y={top + 34} width="34" height={bottom - top - 64} />
      {[-9, -3, 3, 9].map((dx) => (
        <line key={dx} x1={x + dx} y1={top + 44} x2={x + dx} y2={bottom - 40} strokeWidth="0.8" opacity="0.7" />
      ))}
      <rect x={x - 24} y={bottom - 30} width="48" height="12" />
      <rect x={x - 30} y={bottom - 18} width="60" height="18" />
    </g>
  )
}

export const PillarsLayout: React.FC<LayoutProps> = (p) => {
  const { width, height, theme } = p
  const square = p.format === 'square'
  const cap = storyInset(p.format, 330, square ? 140 : 170)
  const base = height - storyInset(p.format, 240, square ? 50 : 64)
  const [lx, rx] = [82, width - 82]
  const rise = square ? 70 : 90
  const fill = theme.light ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.05)'
  const arch = (dy: number) => `M${lx} ${cap + dy} Q${width / 2} ${cap - rise * 2 + dy} ${rx} ${cap + dy}`
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <path d={arch(0)} fill="none" stroke={theme.accent} strokeWidth="2.2" />
        <path d={arch(14)} fill="none" stroke={theme.accent} strokeWidth="0.9" opacity="0.6" />
        <rect x={width / 2 - 6} y={cap - rise - 6} width="12" height="12" fill={theme.accent} transform={`rotate(45 ${width / 2} ${cap - rise})`} />
        <line x1={lx + 30} y1={base} x2={rx - 30} y2={base} stroke={theme.accent} strokeWidth="1" opacity="0.5" />
        <Pillar x={lx} top={cap} bottom={base} color={theme.accent} fill={fill} />
        <Pillar x={rx} top={cap} bottom={base} color={theme.accent} fill={fill} />
      </svg>
      <div style={column(`${cap - (square ? 20 : 10)}px 150px ${height - base + (square ? 40 : 56)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
