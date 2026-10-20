import React from 'react'
import { cardPadding } from '@/lib/cards/cardTypography'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardFrame } from '../CardFrame'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, type LayoutProps } from './layoutTypes'

export const FrameLayout: React.FC<LayoutProps> = (p) => {
  const pad = cardPadding[p.format]
  return (
    <>
      <CardBackdrop theme={p.theme} width={p.width} height={p.height} />
      <CardFrame color={p.theme.accent} width={p.width} height={p.height} />
      <div style={column(`${pad.top}px ${pad.side}px ${pad.bottom}px`)}>
        <CardHeader content={p.content} theme={p.theme} logoSrc={p.logoSrc} />
        <CardBody {...bodyProps(p)} />
        <CardFooter content={p.content} theme={p.theme} />
      </div>
    </>
  )
}
