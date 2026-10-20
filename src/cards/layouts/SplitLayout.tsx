import React from 'react'
import { cardHeaderHeight, cardPadding } from '@/lib/cards/cardTypography'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bandTheme, bodyProps, column, type LayoutProps } from './layoutTypes'
import { useCardStyle } from '../CardStyleContext'
import { titleSlot } from '../titleFonts'

export const SplitLayout: React.FC<LayoutProps> = (p) => {
  const { theme, width, height } = p
  const pad = cardPadding[p.format]
  const band = bandTheme(theme)
  const { fonts, decor, textSizes } = useCardStyle()
  const bandHeight = pad.top + cardHeaderHeight(p.content, fonts[titleSlot(p.content.title)].scale * 1.1, p.format, decor.eyebrow, textSizes) + 56
  const cx = width / 2
  return (
    <>
      <CardBackdrop theme={theme} width={width} height={height} />
      <svg width={width} height={bandHeight + 60} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={`M0 0 H${width} V${bandHeight} Q${cx} ${bandHeight + 60} 0 ${bandHeight} Z`} fill={band.background} />
        <path d={`M0 ${bandHeight - 14} Q${cx} ${bandHeight + 46} ${width} ${bandHeight - 14}`} fill="none" stroke={band.accent} strokeWidth="1.5" opacity="0.7" />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: pad.top, padding: `0 ${pad.side}px` }}>
        <CardHeader content={p.content} theme={band} logoSrc={p.logoSrc} />
      </div>
      <div style={column(`${bandHeight + 90}px ${pad.side}px ${pad.bottom}px`, 32)}>
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={theme} />
      </div>
    </>
  )
}
