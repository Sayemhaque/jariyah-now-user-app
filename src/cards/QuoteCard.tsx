import React from 'react'
import type { CardProps } from '@/lib/cards/types'
import { cardSizes } from '@/lib/cards/types'
import { fitCardType } from '@/lib/cards/cardTypography'
import { CardLayoutView } from './layouts/CardLayoutView'
import { CardStyleContext } from './CardStyleContext'

export const QuoteCard: React.FC<CardProps & { logoSrc: string; onSettled?: () => void }> = ({ content, theme, format, layout = 'frame', titleStyle = 'serif', titleGradient = false, logoSrc, onSettled }) => {
  const { width, height } = cardSizes[format]
  const sizes = React.useMemo(() => fitCardType(content, format), [content, format])
  const style = React.useMemo(() => ({ titleStyle, titleGradient }), [titleStyle, titleGradient])
  return (
    <CardStyleContext.Provider value={style}>
    <div style={{ position: 'relative', width, height, overflow: 'hidden', background: theme.background }}>
      <CardLayoutView
        layout={layout}
        content={content}
        theme={theme}
        format={format}
        width={width}
        height={height}
        sizes={sizes}
        fitKey={`${layout}:${titleStyle}:${format}:${JSON.stringify(content)}`}
        onSettled={onSettled}
        logoSrc={logoSrc}
      />
    </div>
    </CardStyleContext.Provider>
  )
}
