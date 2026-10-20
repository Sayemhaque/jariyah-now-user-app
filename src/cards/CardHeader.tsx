import React from 'react'
import type { CardAlign, CardContent, CardTheme } from '@/lib/cards/types'
import { cardTitleSize, isBengaliText } from '@/lib/cards/cardTypography'
import { arabicTitleFont, gradientText, titleFont } from './titleFonts'
import { useCardStyle } from './CardStyleContext'
import { CardBenefit } from './CardBenefit'
import { banglaDisplayStack, cardCapsStack } from '@/remotion/fontStacks'

interface CardHeaderProps {
  content: CardContent
  theme: CardTheme
  logoSrc?: string
  align?: CardAlign
  eyebrow?: boolean
}

const diamond = (color: string) => <span style={{ width: 8, height: 8, background: color, transform: 'rotate(45deg)', display: 'inline-block' }} />

export const CardHeader: React.FC<CardHeaderProps> = ({ content, theme, logoSrc, align = 'center', eyebrow = true }) => {
  const { titleStyle, titleGradient, format } = useCardStyle()
  const compact = format === 'square'
  const font = titleFont(titleStyle, content.title)
  const titleSize = cardTitleSize(content.title) * font.scale * (compact ? 0.86 : 1)
  const bnEyebrow = isBengaliText(content.eyebrow)
  const left = align === 'left'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: left ? 'flex-start' : 'center', gap: compact ? 12 : 18, width: '100%' }}>
      {logoSrc && <img src={logoSrc} alt="" style={{ height: compact ? 72 : 96, width: 'auto', filter: theme.light ? 'brightness(0)' : 'none', opacity: theme.light ? 0.78 : 0.95 }} />}
      {eyebrow && <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: theme.accent, fontFamily: bnEyebrow ? banglaDisplayStack : cardCapsStack, fontSize: bnEyebrow ? 28 : 22, letterSpacing: bnEyebrow ? '0.06em' : '0.42em', fontWeight: 500, textTransform: 'uppercase', paddingLeft: bnEyebrow ? 0 : '0.42em' }}>
        {!left && diamond(theme.accent)}
        {content.eyebrow}
        {diamond(theme.accent)}
      </div>}
      {content.arabicTitle && (
        <div dir="rtl" style={{ fontFamily: arabicTitleFont(titleStyle), fontSize: compact ? 58 : 78, lineHeight: 1.25, color: theme.light ? theme.arabic : theme.accent, marginTop: 4 }}>
          {content.arabicTitle}
        </div>
      )}
      <div style={{ fontFamily: font.fontFamily, fontSize: titleSize, fontWeight: font.fontWeight, fontStyle: font.fontStyle, lineHeight: font.lineHeight, color: theme.ink, textAlign: left ? 'left' : 'center', maxWidth: 820, letterSpacing: '0.005em', padding: '0 0.08em', ...(titleGradient ? gradientText(theme) : {}) }}>
        {content.title}
      </div>
      {content.benefit && <CardBenefit benefit={content.benefit} theme={theme} align={align} />}
    </div>
  )
}
