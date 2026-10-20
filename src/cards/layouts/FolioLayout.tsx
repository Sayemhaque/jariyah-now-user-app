import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

const Rule: React.FC<{ width: number; y: number; color: string; flip?: boolean }> = ({ width, y, color, flip }) => {
  const [l, r, cx, gap] = [118, width - 118, width / 2, 46]
  const [thick, thin] = flip ? [y + 7, y] : [y, y + 7]
  const oy = y + 3.5
  return (
    <g stroke={color} fill="none">
      {[[l, cx - gap], [cx + gap, r]].map(([a, b], i) => (
        <g key={i}>
          <line x1={a} y1={thick} x2={b} y2={thick} strokeWidth="2.2" />
          <line x1={a} y1={thin} x2={b} y2={thin} strokeWidth="0.8" opacity="0.8" />
        </g>
      ))}
      <path d={`M${cx} ${oy - 10} L${cx + 10} ${oy} L${cx} ${oy + 10} L${cx - 10} ${oy} Z`} fill={color} stroke="none" />
      <path d={`M${cx} ${oy - 16} L${cx + 16} ${oy} L${cx} ${oy + 16} L${cx - 16} ${oy} Z`} strokeWidth="0.9" opacity="0.7" />
      <circle cx={cx - 30} cy={oy} r={2.4} fill={color} stroke="none" />
      <circle cx={cx + 30} cy={oy} r={2.4} fill={color} stroke="none" />
    </g>
  )
}

export const FolioLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const square = p.format === 'square'
  const y = storyInset(p.format, 200, square ? 62 : 76)
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <Rule width={width} y={y} color={theme.accent} />
        <Rule width={width} y={height - y - 7} color={theme.accent} flip />
      </svg>
      <div style={column(`${y + (square ? 54 : 72)}px 150px ${y + (square ? 48 : 64)}px`, square ? 22 : 32)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
