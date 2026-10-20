import React from 'react'
import { cardPadding } from '@/lib/cards/cardTypography'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, type LayoutProps } from './layoutTypes'

export const EditorialLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const pad = cardPadding[p.format]
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <div style={{ position: 'absolute', left: 104, top: pad.top, bottom: pad.bottom, width: 3, background: theme.accent, opacity: 0.8 }} />
      <img src={p.logoSrc} alt="" style={{ position: 'absolute', right: 96, top: pad.top - 10, height: 84, filter: theme.light ? 'brightness(0)' : 'none', opacity: theme.light ? 0.75 : 0.92 }} />
      <div style={{ position: 'absolute', inset: 0, padding: `${pad.top}px 110px ${pad.bottom}px 156px`, display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div style={{ paddingRight: 120 }}>
          <CardHeader content={p.content} theme={theme} align="left" />
        </div>
        <div style={{ width: 120, height: 2, background: theme.accent }} />
        <CardBody {...bodyProps(p)} align="left" quoteMark={false} />
        <div style={{ height: 1, background: theme.accent, opacity: 0.5 }} />
        <CardFooter content={p.content} theme={theme} align="left" divider={false} />
      </div>
    </>
  )
}
