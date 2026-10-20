import React from 'react'
import type { CardProps } from '@/lib/cards/types'
import { cardSizes } from '@/lib/cards/types'
import { fitCardType } from '@/lib/cards/cardTypography'
import { CardLayoutView } from './layouts/CardLayoutView'

export const QuoteCard: React.FC<CardProps & { logoSrc: string; onSettled?: () => void }> = ({ content, theme, format, layout = 'frame', logoSrc, onSettled }) => {
  const { width, height } = cardSizes[format]
  const sizes = React.useMemo(() => fitCardType(content, format), [content, format])
  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', background: theme.background }}>
      <CardLayoutView
        layout={layout}
        content={content}
        theme={theme}
        format={format}
        width={width}
        height={height}
        sizes={sizes}
        fitKey={`${layout}:${format}:${JSON.stringify(content)}`}
        onSettled={onSettled}
        logoSrc={logoSrc}
      />
    </div>
  )
}
