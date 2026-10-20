import React from 'react'
import type { CardAlign, CardContent, CardTheme } from '@/lib/cards/types'
import type { CardTypeSizes } from '@/lib/cards/cardTypography'
import { cardDisplayStack } from '@/remotion/fontStacks'
import { CardLineText } from './CardLineText'
import { fitted, useShrinkToFit } from './useShrinkToFit'

interface CardBodyProps {
  content: CardContent
  theme: CardTheme
  sizes: CardTypeSizes
  fitKey: string
  onSettled?: () => void
  align?: CardAlign
  quoteMark?: boolean
}

const QuoteMark: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <div style={{ fontFamily: cardDisplayStack, fontSize: fitted(size), lineHeight: 0.6, height: fitted(size * 0.42), color, opacity: 0.85 }}>“</div>
)

export const CardBody: React.FC<CardBodyProps> = ({ content, theme, sizes, fitKey, onSettled, align = 'center', quoteMark }) => {
  const { boxRef, contentRef } = useShrinkToFit(fitKey, onSettled)
  const quranic = content.kind === 'dua' || content.kind === 'masnoon'
  const quote = quoteMark ?? content.kind === 'hadith'
  const items = align === 'left' ? 'flex-start' : 'center'
  return (
    <div ref={boxRef} data-card-body style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: items, justifyContent: 'center', width: '100%' }}>
      <div ref={contentRef} style={{ display: 'flex', flexDirection: 'column', alignItems: items, gap: fitted(44 * sizes.scale), width: '100%' }}>
      {quote && <QuoteMark color={theme.accent} size={sizes.translation * 3} />}
      {content.lines.map((line, index) => (
        <React.Fragment key={index}>
          {index > 0 && <div style={{ width: 6, height: 6, borderRadius: 3, background: theme.accent, opacity: 0.7 }} />}
          <CardLineText line={line} theme={theme} sizes={sizes} quranic={quranic} align={align} />
        </React.Fragment>
      ))}
      </div>
    </div>
  )
}
