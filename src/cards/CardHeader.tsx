import React from 'react'
import type { CardAlign, CardContent, CardTheme } from '@/lib/cards/types'
import { cardTitleSize } from '@/lib/cards/cardTypography'
import { arabicTitleFont, fontCss, gradientText, titleSlot } from './titleFonts'
import { useCardStyle } from './CardStyleContext'
import { CardBenefit } from './CardBenefit'
import { CardEyebrow } from './CardEyebrow'

interface CardHeaderProps {
  content: CardContent
  theme: CardTheme
  logoSrc?: string
  align?: CardAlign
  eyebrow?: boolean
}

export const CardHeader: React.FC<CardHeaderProps> = ({ content, theme, logoSrc, align = 'center', eyebrow = true }) => {
  const { titleStyle, titleGradient, format, decor, fonts } = useCardStyle()
  const compact = format === 'square'
  const font = fonts[titleSlot(content.title)]
  const titleSize = cardTitleSize(content.title) * font.scale * (compact ? 0.86 : 1)
  const left = align === 'left'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: left ? 'flex-start' : 'center', gap: compact ? 12 : 18, width: '100%' }}>
      {logoSrc && <img src={logoSrc} alt="" style={{ height: compact ? 72 : 96, width: 'auto', filter: theme.light ? 'brightness(0)' : 'none', opacity: theme.light ? 0.78 : 0.95 }} />}
      {eyebrow && <CardEyebrow text={content.eyebrow} theme={theme} style={decor.eyebrow} align={align} />}
      {content.arabicTitle && (
        <div dir="rtl" style={{ fontFamily: arabicTitleFont(titleStyle, fonts.arabic), fontSize: compact ? 58 : 78, lineHeight: 1.25, color: theme.light ? theme.arabic : theme.accent, marginTop: 4 }}>
          {content.arabicTitle}
        </div>
      )}
      <div style={{ ...fontCss(font), fontSize: titleSize, lineHeight: font.lineHeight, color: theme.ink, textAlign: left ? 'left' : 'center', maxWidth: 820, letterSpacing: '0.005em', padding: '0 0.08em', ...(titleGradient ? gradientText(theme) : {}) }}>
        {content.title}
      </div>
      {content.benefit && <CardBenefit benefit={content.benefit} theme={theme} align={align} />}
    </div>
  )
}
