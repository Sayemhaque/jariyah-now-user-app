import React from 'react'
import type { CardAlign, CardTheme } from '@/lib/cards/types'
import { CardBackdrop } from '../CardBackdrop'
import { CardBody } from '../CardBody'
import { CardFooter } from '../CardFooter'
import { CardHeader } from '../CardHeader'
import { bodyProps, column, fullSvg, type LayoutProps } from './layoutTypes'

export interface OrnamentLayoutProps extends LayoutProps {
  padding: string
  gap?: number
  pattern?: boolean
  vignette?: boolean
  align?: CardAlign
  behind?: React.ReactNode
  art?: React.ReactNode
  inkTheme?: CardTheme
}

export const OrnamentLayout: React.FC<OrnamentLayoutProps> = ({ padding, gap = 30, pattern = true, vignette = true, align = 'center', behind, art, inkTheme, ...p }) => {
  const ink = inkTheme ?? p.theme
  return (
    <>
      <CardBackdrop theme={p.theme} width={p.width} height={p.height} pattern={pattern} vignette={vignette} />
      {behind}
      {art && <svg {...fullSvg(p.width, p.height)}>{art}</svg>}
      <div style={{ ...column(padding, gap), alignItems: align === 'left' ? 'flex-start' : 'center' }}>
        <CardHeader content={p.content} theme={ink} logoSrc={p.logoSrc} align={align} />
        <CardBody {...bodyProps({ ...p, theme: ink })} align={align} quoteMark={align === 'left' ? false : undefined} />
        <CardFooter content={p.content} theme={ink} align={align} />
      </div>
    </>
  )
}
