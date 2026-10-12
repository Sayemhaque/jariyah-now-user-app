import { autoFontSizes, type VideoSettings } from './types'

export const defaultVideoSettings: VideoSettings = {
  backgroundImage: '/backgrounds/twilight-mosque-portrait.png',
  backgroundPreset: 'twilight-mosque',
  overlayStyle: 'bottom-gradient',
  overlayColor: '#000000',
  overlayOpacity: 55,
  fontColor: '#ffffff',
  highlightColor: '#e8c36a',
  wordHighlight: true,
  arabicFontSize: autoFontSizes.portrait.arabic,
  translationFontSize: autoFontSizes.portrait.translation,
  fontStyle: 'quran',
  arabicFont: 'quran',
  bengaliFont: 'sans',
  useTajweed: false,
  showTranslation: true,
  showTransliteration: false,
  orientation: 'portrait',
  autoFitFonts: true,
  textWidth: 'wide',
  textSpacing: 'normal',
}
