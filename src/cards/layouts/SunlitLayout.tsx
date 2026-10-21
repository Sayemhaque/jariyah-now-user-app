import React from 'react'
import { cardPadding } from '@/lib/cards/cardTypography'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardGrain } from '../CardGrain'
import { CardHeader } from '../CardHeader'
import { bodyProps, type LayoutProps } from './layoutTypes'
import { PalmShadow, WindowLight } from './LightShadows'

export const SunlitLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const pad = cardPadding[p.format]
  const square = p.format === 'square'
  const rule = <div style={{ width: 120, height: 2, background: theme.accent, opacity: 0.8 }} />
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: theme.background }} />
      <div style={{ position: 'absolute', inset: 0, background: theme.light ? 'linear-gradient(160deg, rgba(255,250,240,0.55), rgba(196,160,118,0.18))' : 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(0,0,0,0.25))' }} />
      <WindowLight light={theme.light} />
      <PalmShadow width={width} height={height} color={theme.light ? 'rgba(92,66,40,0.2)' : 'rgba(0,0,0,0.42)'} />
      <CardGrain width={width} height={height} opacity={theme.grain} light={theme.light} />
      <img src={p.logoSrc} alt="" style={{ position: 'absolute', left: 120, bottom: pad.bottom - 40, height: 58, filter: theme.light ? 'brightness(0)' : 'none', opacity: theme.light ? 0.5 : 0.75 }} />
      <div style={{ position: 'absolute', inset: 0, padding: `${pad.top + (square ? 10 : 40)}px 220px ${pad.bottom + 50}px 120px`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: square ? 22 : 34 }}>
        <CardHeader content={p.content} theme={theme} align="left" />
        {rule}
        <CardBody {...bodyProps(p)} align="left" quoteMark={false} />
        {rule}
        <CardFooter content={p.content} theme={theme} align="left" divider={false} />
      </div>
    </>
  )
}
