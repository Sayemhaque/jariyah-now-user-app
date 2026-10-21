import React from 'react'
import { cardPadding } from '@/lib/cards/cardTypography'
import type { CardTheme } from '@/lib/cards/types'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardGrain } from '../CardGrain'
import { CardHeader } from '../CardHeader'
import { bodyProps, type LayoutProps } from './layoutTypes'

export const shadowTone = (theme: CardTheme, strength = 1) => (theme.light ? `rgba(92,66,40,${0.2 * strength})` : `rgba(0,0,0,${0.42 * strength})`)
export const lightTone = (theme: CardTheme, strength = 1) => (theme.light ? `rgba(255,248,232,${0.7 * strength})` : `rgba(255,240,210,${0.12 * strength})`)

interface SunlitFrameProps extends LayoutProps {
  shadow: React.ReactNode
  align?: 'left' | 'center'
}

export const SunlitFrame: React.FC<SunlitFrameProps> = ({ shadow, align = 'left', ...p }) => {
  const { theme, width, height } = p
  const pad = cardPadding[p.format]
  const square = p.format === 'square'
  const left = align === 'left'
  const rule = <div style={{ width: 120, height: 2, background: theme.accent, opacity: 0.8 }} />
  const sides = left ? '220px 120px' : '150px 150px'
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: theme.background }} />
      <div style={{ position: 'absolute', inset: 0, background: theme.light ? 'linear-gradient(160deg, rgba(255,250,240,0.55), rgba(196,160,118,0.18))' : 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(0,0,0,0.25))' }} />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>{shadow}</div>
      <CardGrain width={width} height={height} opacity={theme.grain} light={theme.light} />
      <img src={p.logoSrc} alt="" style={{ position: 'absolute', ...(left ? { left: 120 } : { left: '50%', transform: 'translateX(-50%)' }), bottom: pad.bottom - 40, height: 58, filter: theme.light ? 'brightness(0)' : 'none', opacity: theme.light ? 0.5 : 0.75 }} />
      <div style={{ position: 'absolute', inset: 0, padding: `${pad.top + (square ? 10 : 40)}px ${sides.split(' ')[0]} ${pad.bottom + 50}px ${sides.split(' ')[1]}`, display: 'flex', flexDirection: 'column', alignItems: left ? 'flex-start' : 'center', gap: square ? 22 : 34 }}>
        <CardHeader content={p.content} theme={theme} align={align} />
        {rule}
        <CardBody {...bodyProps(p)} align={align} quoteMark={false} />
        {rule}
        <CardFooter content={p.content} theme={theme} align={align} divider={false} />
      </div>
    </>
  )
}
