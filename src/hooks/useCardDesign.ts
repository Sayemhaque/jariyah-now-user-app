import { useContent } from '@/lib/contentStore'
import { findCardTheme } from '@/lib/cards/themes'

export function useCardDesign() {
  const { cardThemeKey, cardLayout, cardVariant, eyebrowStyle, titleStyle, titleGradient, cardFormat, fonts, customFonts } = useContent()
  return {
    theme: findCardTheme(cardThemeKey),
    format: cardFormat,
    layout: cardLayout,
    variant: cardVariant,
    eyebrowStyle: eyebrowStyle ?? undefined,
    titleStyle,
    titleGradient,
    fonts,
    customFonts,
  }
}
