import React from 'react'
import { cardPadding } from '@/lib/cards/cardTypography'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, type LayoutProps } from './layoutTypes'

function Star({ cx, cy, s, color, width, opacity }: { cx: number; cy: number; s: number; color: string; width: number; opacity: number }) {
  return (
    <g fill="none" stroke={color} strokeWidth={width} opacity={opacity}>
      <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} />
      <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} transform={`rotate(45 ${cx} ${cy})`} />
    </g>
  )
}

export const KhatamLayout: React.FC<LayoutProps> = (p) => {
  const { width, height, theme } = p
  const pad = cardPadding[p.format]
  const [cx, cy] = [width / 2, height / 2]
  const s = width * 0.36
  const e = p.format === 'square' ? 40 : 46
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`rotate(22.5 ${cx} ${cy})`}>
          <Star cx={cx} cy={cy} s={s} color={theme.accent} width={2} opacity={theme.light ? 0.2 : 0.16} />
          <Star cx={cx} cy={cy} s={s - 22} color={theme.accent} width={0.9} opacity={theme.light ? 0.16 : 0.12} />
          <Star cx={cx} cy={cy} s={s * 0.42} color={theme.accent} width={0.9} opacity={theme.light ? 0.12 : 0.09} />
        </g>
        <circle cx={cx} cy={cy} r={s * 0.93} fill="none" stroke={theme.accent} strokeWidth="0.8" strokeDasharray="2 9" opacity="0.18" />
        <rect x={e} y={e} width={width - e * 2} height={height - e * 2} fill="none" stroke={theme.accent} strokeWidth="1.1" opacity="0.6" />
        {[[e, e], [width - e, e], [e, height - e], [width - e, height - e]].map(([x, y], i) => (
          <rect key={i} x={x - 5} y={y - 5} width="10" height="10" fill={theme.accent} transform={`rotate(45 ${x} ${y})`} />
        ))}
      </svg>
      <div style={column(`${pad.top + 10}px 140px ${pad.bottom + 10}px`, p.format === 'square' ? 24 : 34)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
