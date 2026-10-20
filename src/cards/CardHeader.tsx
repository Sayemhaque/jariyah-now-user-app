import React from 'react'
import type { CardAlign, CardContent, CardTheme } from '@/lib/cards/types'
import { cardTitleSize } from '@/lib/cards/cardTypography'
import { cardCapsStack, cardDisplayStack, headerArabicStack } from '@/remotion/fontStacks'

interface CardHeaderProps {
  content: CardContent
  theme: CardTheme
  logoSrc?: string
  align?: CardAlign
  eyebrow?: boolean
}

const diamond = (color: string) => <span style={{ width: 8, height: 8, background: color, transform: 'rotate(45deg)', display: 'inline-block' }} />

export const CardHeader: React.FC<CardHeaderProps> = ({ content, theme, logoSrc, align = 'center', eyebrow = true }) => {
  const titleSize = cardTitleSize(content.title)
  const left = align === 'left'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: left ? 'flex-start' : 'center', gap: 18, width: '100%' }}>
      {logoSrc && <img src={logoSrc} alt="" style={{ height: 96, width: 'auto', filter: theme.light ? 'brightness(0)' : 'none', opacity: theme.light ? 0.78 : 0.95 }} />}
      {eyebrow && <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: theme.accent, fontFamily: cardCapsStack, fontSize: 22, letterSpacing: '0.42em', fontWeight: 500, textTransform: 'uppercase', paddingLeft: '0.42em' }}>
        {!left && diamond(theme.accent)}
        {content.eyebrow}
        {diamond(theme.accent)}
      </div>}
      {content.arabicTitle && (
        <div dir="rtl" style={{ fontFamily: headerArabicStack, fontSize: 78, lineHeight: 1.25, color: theme.light ? theme.arabic : theme.accent, marginTop: 4 }}>
          {content.arabicTitle}
        </div>
      )}
      <div style={{ fontFamily: cardDisplayStack, fontSize: titleSize, fontWeight: 600, lineHeight: 1.1, color: theme.ink, textAlign: left ? 'left' : 'center', maxWidth: 820, letterSpacing: '0.005em' }}>
        {content.title}
      </div>
    </div>
  )
}
