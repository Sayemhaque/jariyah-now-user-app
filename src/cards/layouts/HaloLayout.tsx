import React from 'react'
import { cardPadding } from '@/lib/cards/cardTypography'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, type LayoutProps } from './layoutTypes'

export const HaloLayout: React.FC<LayoutProps> = (p) => {
  const { width, height, theme } = p
  const pad = cardPadding[p.format]
  const cx = width / 2
  const cy = pad.top + (p.format === 'square' ? 40 : 60)
  const reach = p.format === 'square' ? 520 : 640
  const at = `${cx}px ${cy}px`
  const fade = `radial-gradient(circle at ${at}, #000 0, rgba(0,0,0,0.5) ${reach * 0.45}px, transparent ${reach}px)`
  const rays = `repeating-conic-gradient(from 0deg at ${at}, ${theme.accent}${theme.light ? '2e' : '26'} 0deg 1.2deg, transparent 1.2deg 7.5deg)`
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at ${at}, ${theme.accent}${theme.light ? '38' : '44'} 0, ${theme.accent}10 ${reach * 0.4}px, transparent ${reach * 0.8}px)` }} />
      <div style={{ position: 'absolute', inset: 0, background: rays, WebkitMaskImage: fade, maskImage: fade }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {[110, 180, 260, 350, 450].map((r, i) => (
          <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={theme.accent} strokeWidth={i === 1 ? 1.4 : 0.9} strokeDasharray={i === 2 ? '2 8' : undefined} opacity={0.5 - i * 0.09} />
        ))}
      </svg>
      <div style={column(`${pad.top + 10}px 140px ${pad.bottom + 20}px`, p.format === 'square' ? 24 : 34)}>
        <CardHeader content={p.content} theme={theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
