import React from 'react'
import type { CardContent, CardTheme } from '@/lib/cards/types'
import type { CardTypeSizes } from '@/lib/cards/cardTypography'
import { cardDisplayStack } from '@/remotion/fontStacks'
import { CardLineText } from './CardLineText'

interface CardBodyProps {
  content: CardContent
  theme: CardTheme
  sizes: CardTypeSizes
}

const QuoteMark: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <div style={{ fontFamily: cardDisplayStack, fontSize: size, lineHeight: 0.6, height: size * 0.42, color, opacity: 0.85 }}>“</div>
)

export const CardBody: React.FC<CardBodyProps> = ({ content, theme, sizes }) => {
  const quranic = content.kind === 'dua' || content.kind === 'masnoon'
  const quote = content.kind === 'hadith'
  return (
    <div data-card-body style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44 * sizes.scale, width: '100%' }}>
      {quote && <QuoteMark color={theme.accent} size={sizes.translation * 3} />}
      {content.lines.map((line, index) => (
        <React.Fragment key={index}>
          {index > 0 && <div style={{ width: 6, height: 6, borderRadius: 3, background: theme.accent, opacity: 0.7 }} />}
          <CardLineText line={line} theme={theme} sizes={sizes} quranic={quranic} />
        </React.Fragment>
      ))}
    </div>
  )
}
