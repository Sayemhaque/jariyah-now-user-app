import React from 'react'
import type { CardProps } from '@/lib/cards/types'
import { cardSizes } from '@/lib/cards/types'
import { fitCardType } from '@/lib/cards/cardTypography'
import { CardLayoutView } from './layouts/CardLayoutView'
import { CardStyleContext } from './CardStyleContext'
import { CornerOrnaments } from './CornerOrnaments'
import { resolveDecor } from '@/lib/cards/variants'
import { defaultFonts, findFont, fontsForStyle, type FontSlot } from '@/lib/cards/fontLibrary'
import { resolveTextSizes } from '@/lib/cards/textSizes'

export const QuoteCard: React.FC<CardProps & { logoSrc: string; onSettled?: () => void }> = ({ content, theme, format, layout = 'frame', variant = 'signature', eyebrowStyle, titleStyle = 'serif', titleGradient = false, fonts, customFonts, textSizes, logoSrc, onSettled }) => {
  const { width, height } = cardSizes[format]
  const parts = React.useMemo(() => resolveTextSizes(textSizes), [textSizes])
  const sizes = React.useMemo(() => {
    const fit = fitCardType(content, format)
    return { ...fit, arabic: fit.arabic * parts.arabic, translation: fit.translation * parts.translation }
  }, [content, format, parts])
  const decor = React.useMemo(() => resolveDecor(layout, variant, eyebrowStyle), [layout, variant, eyebrowStyle])
  const resolvedFonts = React.useMemo(() => {
    const choice = { ...defaultFonts, ...fontsForStyle[titleStyle], ...fonts }
    return Object.fromEntries((Object.keys(choice) as FontSlot[]).map((slot) => [slot, findFont(choice[slot], slot, customFonts)])) as Record<FontSlot, ReturnType<typeof findFont>>
  }, [titleStyle, fonts, customFonts])
  const style = React.useMemo(() => ({ titleStyle, titleGradient, format, decor, fonts: resolvedFonts, textSizes: parts }), [titleStyle, titleGradient, format, decor, resolvedFonts, parts])
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
        fitKey={`${layout}:${variant}:${decor.eyebrow}:${titleStyle}:${JSON.stringify(fonts ?? {})}:${JSON.stringify(parts)}:${format}:${JSON.stringify(content)}`}
        onSettled={onSettled}
        logoSrc={logoSrc}
      />
      <CornerOrnaments style={decor.corners} theme={theme} width={width} height={height} />
    </div>
    </CardStyleContext.Provider>
  )
}
