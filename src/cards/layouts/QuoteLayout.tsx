import React from 'react'
import { cardPadding } from '@/lib/cards/cardTypography'
import { cardDisplayStack } from '@/remotion/fontStacks'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, type LayoutProps } from './layoutTypes'

export const QuoteLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const pad = cardPadding[p.format]
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <div style={{ position: 'absolute', left: 40, top: pad.top - 230, fontFamily: cardDisplayStack, fontSize: 900, lineHeight: 1, color: theme.accent, opacity: theme.light ? 0.13 : 0.16 }}>“</div>
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: width * 0.45, height: 14, background: theme.accent }} />
      <img src={p.logoSrc} alt="" style={{ position: 'absolute', right: 100, bottom: pad.bottom - 6, height: 80, filter: theme.light ? 'brightness(0)' : 'none', opacity: theme.light ? 0.72 : 0.9 }} />
      <div style={{ position: 'absolute', inset: 0, padding: `${pad.top + 40}px 120px ${pad.bottom}px 120px`, display: 'flex', flexDirection: 'column', gap: 40 }}>
        <CardHeader content={p.content} theme={theme} align="left" />
        <CardBody {...bodyProps(p)} align="left" quoteMark={false} />
        <div style={{ width: 160, height: 8, background: theme.accent, borderRadius: 4 }} />
        <div style={{ paddingRight: 200 }}>
          <CardFooter content={p.content} theme={theme} align="left" divider={false} />
        </div>
      </div>
    </>
  )
}
