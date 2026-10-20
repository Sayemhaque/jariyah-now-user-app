import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, panelFill, storyInset, type LayoutProps } from './layoutTypes'

function Lantern({ x, cord, s, color, fill }: { x: number; cord: number; s: number; color: string; fill: string }) {
  return (
    <g>
      <line x1={x} y1={0} x2={x} y2={cord} stroke={color} strokeWidth="1.2" opacity="0.7" />
      <g transform={`translate(${x} ${cord}) scale(${s})`} stroke={color} strokeWidth={1.6 / s} strokeLinejoin="round">
        <circle cy="4" r="4" fill="none" />
        <path d="M-12 8 H12 L18 20 H-18 Z" fill={color} />
        <path d="M-22 20 C-34 48 -34 82 -22 108 H22 C34 82 34 48 22 20 Z" fill={fill} />
        <path d="M-8 26 C-12 50 -12 80 -8 102 M8 26 C12 50 12 80 8 102" fill="none" opacity="0.6" />
        <ellipse cy="64" rx="7" ry="16" fill={color} opacity="0.55" stroke="none" />
        <path d="M-22 108 L-12 120 H12 L22 108 Z" fill={color} />
        <path d="M0 120 V140 M0 140 l-4 8 h8 Z" fill={color} />
      </g>
    </g>
  )
}

export const LanternLayout: React.FC<LayoutProps> = (p) => {
  const { width, height, theme } = p
  const square = p.format === 'square'
  const s = storyInset(p.format, 1.25, square ? 0.78 : 1)
  const band = storyInset(p.format, 400, square ? 176 : 250)
  const lanterns = [[width * 0.24, band - 148 * s - 46], [width / 2, band - 148 * s - 8], [width * 0.76, band - 148 * s - 46]]
  const glow = lanterns.map(([x, c]) => `radial-gradient(circle at ${x}px ${c + 64 * s}px, ${theme.accent}${theme.light ? '40' : '55'} 0, transparent ${110 * s}px)`).join(', ')
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <div style={{ position: 'absolute', inset: 0, background: glow }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {lanterns.map(([x, c], i) => (
          <Lantern key={i} x={x} cord={c} s={s} color={theme.accent} fill={panelFill(theme)} />
        ))}
      </svg>
      <div style={column(`${band + (square ? 20 : 40)}px 140px ${storyInset(p.format, 260, square ? 70 : 96)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
