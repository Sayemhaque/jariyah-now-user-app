import React from 'react'
import { isBengaliText } from '@/lib/cards/cardTypography'
import { banglaDisplayStack, cardCapsStack } from '@/remotion/fontStacks'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bandTheme, bodyProps, column, storyInset, type LayoutProps } from './layoutTypes'

export const ManuscriptLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const band = bandTheme(theme)
  const top = storyInset(p.format, 250, 76)
  const bandTop = top + 120
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} />
      <div style={{ position: 'absolute', inset: 50, border: `2px solid ${theme.accent}`, opacity: 0.8 }} />
      <div style={{ position: 'absolute', inset: 62, border: `0.8px solid ${theme.accent}`, opacity: 0.6 }} />
      <img src={p.logoSrc} alt="" style={{ position: 'absolute', left: '50%', top, height: 92, transform: 'translateX(-50%)', filter: theme.light ? 'brightness(0)' : 'none', opacity: theme.light ? 0.78 : 0.95 }} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: bandTop, height: 96, background: band.background, border: `2px solid ${theme.accent}`, display: 'grid', placeItems: 'center' }}>
        <div style={{ padding: '12px 56px', borderRadius: 999, border: `1.5px solid ${band.accent}`, color: band.ink, ...(isBengaliText(p.content.eyebrow) ? { fontFamily: banglaDisplayStack, fontSize: 30, letterSpacing: '0.04em' } : { fontFamily: cardCapsStack, fontSize: 24, letterSpacing: '0.4em', paddingLeft: 'calc(56px + 0.4em)' }), textTransform: 'uppercase' }}>
          {p.content.eyebrow}
        </div>
      </div>
      <div style={column(`${bandTop + 140}px 140px ${storyInset(p.format, 290, 110)}px`, 30)}>
        <CardHeader content={p.content} theme={theme} eyebrow={false} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
