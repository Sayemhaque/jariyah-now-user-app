import React from 'react'
import { isBengaliText } from '@/lib/cards/cardTypography'
import type { CardAlign, CardTheme, EyebrowStyle } from '@/lib/cards/types'
import { arabicFontStacks, banglaDisplayStack, cardCapsStack } from '@/remotion/fontStacks'
import { useCardStyle } from './CardStyleContext'
import { EyebrowRibbon, EyebrowSeal, EyebrowSwash, Crescent } from './EyebrowShapes'

interface CardEyebrowProps {
  text: string
  theme: CardTheme
  style: EyebrowStyle
  align: CardAlign
}

const diamond = (color: string) => <span style={{ width: 8, height: 8, background: color, transform: 'rotate(45deg)', display: 'inline-block' }} />
const line = (color: string) => <span style={{ width: 64, height: 1.5, background: color, display: 'inline-block' }} />
const dot = (color: string) => <span style={{ width: 5, height: 5, borderRadius: 3, background: color, display: 'inline-block' }} />

export const CardEyebrow: React.FC<CardEyebrowProps> = ({ text, theme, style, align }) => {
  const bangla = isBengaliText(text)
  const scale = useCardStyle().textSizes.eyebrow
  const left = align === 'left'
  const base: React.CSSProperties = bangla
    ? { fontFamily: banglaDisplayStack, fontSize: 28 * scale, letterSpacing: '0.06em' }
    : { fontFamily: cardCapsStack, fontSize: 22 * scale, letterSpacing: '0.42em', paddingLeft: left ? 0 : '0.42em', textTransform: 'uppercase' }
  const label = <span style={{ ...base, fontWeight: 500, color: style === 'pill' ? (theme.light ? '#ffffff' : '#1b140a') : theme.accent }}>{text}</span>
  const row = (children: React.ReactNode) => <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>{children}</div>

  switch (style) {
    case 'lines':
      return row(<>{!left && line(theme.accent)}{label}{line(theme.accent)}</>)
    case 'pill':
      return <div style={{ padding: '10px 30px', borderRadius: 999, background: theme.light ? theme.arabic : theme.accent }}>{label}</div>
    case 'ribbon':
      return <EyebrowRibbon color={theme.accent}>{label}</EyebrowRibbon>
    case 'brackets':
      return row(<><span style={{ fontFamily: arabicFontStacks.amiri, fontSize: 44, color: theme.accent, lineHeight: 1 }}>﴾</span>{label}<span style={{ fontFamily: arabicFontStacks.amiri, fontSize: 44, color: theme.accent, lineHeight: 1 }}>﴿</span></>)
    case 'seal':
      return <div style={{ display: 'flex', flexDirection: 'column', alignItems: left ? 'flex-start' : 'center', gap: 8 }}><EyebrowSeal color={theme.accent} />{label}</div>
    case 'crescent':
      return row(<><Crescent color={theme.accent} />{label}</>)
    case 'stacked':
      return <div style={{ display: 'flex', flexDirection: 'column', alignItems: left ? 'flex-start' : 'center', gap: 4 }}>{label}<EyebrowSwash color={theme.accent} /></div>
    case 'dots':
      return row(<><span style={{ color: theme.accent, fontSize: 20 }}>✦</span>{dot(theme.accent)}{label}{dot(theme.accent)}<span style={{ color: theme.accent, fontSize: 20 }}>✦</span></>)
    default:
      return row(<>{!left && diamond(theme.accent)}{label}{diamond(theme.accent)}</>)
  }
}
