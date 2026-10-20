import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, panelFill, storyInset, type LayoutProps } from './layoutTypes'

function Rosette({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-11" y="-11" width="22" height="22" fill={color} opacity="0.85" />
      <rect x="-11" y="-11" width="22" height="22" fill={color} opacity="0.85" transform="rotate(45)" />
      <circle r="18" fill="none" stroke={color} strokeWidth="1" opacity="0.55" />
      <circle r="4" fill={color} />
    </g>
  )
}

export const MedallionLayout: React.FC<LayoutProps> = (p) => {
  const { width, height, theme } = p
  const square = p.format === 'square'
  const m = square ? 48 : 60
  const r = width / 2 - m
  const top = storyInset(p.format, 210, m)
  const bottom = height - top
  const ring = (inset: number) => ({ x: m + inset, y: top + inset, width: 2 * (r - inset), height: bottom - top - 2 * inset, rx: r - inset })
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${theme.accent}${theme.light ? '22' : '1c'} 0, transparent 70%)` }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <rect {...ring(0)} fill="none" stroke={theme.accent} strokeWidth="2.4" />
        <rect {...ring(14)} fill="none" stroke={theme.accent} strokeWidth="1.2" strokeDasharray="1.5 7" strokeLinecap="round" opacity="0.8" />
        <rect {...ring(28)} fill={panelFill(theme)} stroke={theme.accent} strokeWidth="0.8" opacity="0.9" />
        <Rosette x={width / 2} y={top} color={theme.accent} />
        <Rosette x={width / 2} y={bottom} color={theme.accent} />
        <Rosette x={m} y={height / 2} color={theme.accent} />
        <Rosette x={width - m} y={height / 2} color={theme.accent} />
      </svg>
      <div style={column(`${top + (square ? 118 : 150)}px 150px ${top + (square ? 104 : 130)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
