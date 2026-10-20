import React from 'react'
import type { CardProps } from '@/lib/cards/types'
import { cardSizes } from '@/lib/cards/types'
import { cardPadding, fitCardType } from '@/lib/cards/cardTypography'
import { CardBody } from './CardBody'
import { CardFooter } from './CardFooter'
import { CardFrame } from './CardFrame'
import { CardGrain } from './CardGrain'
import { CardHeader } from './CardHeader'
import { CardPattern } from './CardPattern'

export const QuoteCard: React.FC<CardProps & { logoSrc: string; onSettled?: () => void }> = ({ content, theme, format, logoSrc, onSettled }) => {
  const { width, height } = cardSizes[format]
  const sizes = React.useMemo(() => fitCardType(content, format), [content, format])
  const padding = cardPadding[format]
  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', background: theme.background }}>
      <div style={{ position: 'absolute', inset: 0, background: theme.glow }} />
      <CardPattern pattern={theme.pattern} color={theme.accent} opacity={theme.patternOpacity} width={width} height={height} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 85% 75% at 50% 50%, transparent 55%, ${theme.light ? 'rgba(90, 60, 20, 0.16)' : 'rgba(0, 0, 0, 0.5)'} 100%)` }} />
      <CardGrain width={width} height={height} opacity={theme.grain} light={theme.light} />
      <CardFrame color={theme.accent} width={width} height={height} />
      <div style={{ position: 'absolute', inset: 0, padding: `${padding.top}px ${padding.side}px ${padding.bottom}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
        <CardHeader content={content} theme={theme} logoSrc={logoSrc} />
        <CardBody content={content} theme={theme} sizes={sizes} fitKey={`${format}:${JSON.stringify(content)}`} onSettled={onSettled} />
        <CardFooter content={content} theme={theme} />
      </div>
    </div>
  )
}
