import React from 'react'
import { cardPadding } from '@/lib/cards/cardTypography'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, type LayoutProps } from './layoutTypes'

export const MinimalLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const pad = cardPadding[p.format]
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} pattern={false} vignette={false} />
      <img src={p.logoSrc} alt="" style={{ position: 'absolute', left: '50%', bottom: pad.bottom - 30, height: 64, transform: 'translateX(-50%)', filter: theme.light ? 'brightness(0)' : 'none', opacity: theme.light ? 0.6 : 0.8 }} />
      <div style={column(`${pad.top + 30}px 170px ${pad.bottom + 70}px`, 44)}>
        <CardHeader content={p.content} theme={theme} />
        <CardBody {...bodyProps(p)} quoteMark={false} />
        <div style={{ width: 8, height: 8, borderRadius: 4, background: theme.accent }} />
        <CardFooter content={p.content} theme={theme} divider={false} />
      </div>
    </>
  )
}
