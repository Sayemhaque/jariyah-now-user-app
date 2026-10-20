import React from 'react'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

const half = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} Z`
const arc = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`

export const DawnLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const square = p.format === 'square'
  const horizon = height - storyInset(p.format, 330, square ? 96 : 150)
  const sun = storyInset(p.format, 230, square ? 100 : 170)
  const cx = width / 2
  const glowY = (horizon / height) * 100
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${theme.accent}${theme.light ? '2e' : '38'} 0%, ${theme.accent}10 ${100 - glowY + 22}%, transparent 72%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% ${glowY}%, ${theme.accent}${theme.light ? '30' : '40'} 0, transparent ${sun * 2.4}px)` }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <path d={half(cx, horizon, sun)} fill={theme.accent} opacity={theme.light ? 0.2 : 0.26} />
        <path d={arc(cx, horizon, sun + 34)} fill="none" stroke={theme.accent} strokeWidth="1" opacity="0.4" />
        <path d={arc(cx, horizon, sun + 76)} fill="none" stroke={theme.accent} strokeWidth="0.8" opacity="0.2" />
        <line x1={90} y1={horizon} x2={width - 90} y2={horizon} stroke={theme.accent} strokeWidth="1.4" opacity="0.85" />
        {[0.7, 0.45, 0.25].map((w, i) => (
          <line key={i} x1={cx - sun * w} y1={horizon + 18 + i * 16} x2={cx + sun * w} y2={horizon + 18 + i * 16} stroke={theme.accent} strokeWidth="1" opacity={0.4 - i * 0.1} />
        ))}
      </svg>
      <div style={column(`${storyInset(p.format, 250, square ? 76 : 100)}px 140px ${height - horizon + sun + (square ? 26 : 40)}px`, square ? 22 : 30)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
