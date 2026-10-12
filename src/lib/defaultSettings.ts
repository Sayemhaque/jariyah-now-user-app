import { defaultScene, sceneUrl } from './backgroundPresets'
import { autoFontSizes, type VideoSettings } from './types'

export const defaultVideoSettings: VideoSettings = {
  backgroundImage: sceneUrl(defaultScene.key),
  backgroundPreset: defaultScene.key,
  overlayStyle: 'bottom-gradient',
  overlayColor: '#000000',
  overlayOpacity: 55,
  fontColor: defaultScene.palette.text,
  highlightColor: defaultScene.palette.accent,
  translationColor: defaultScene.palette.translation,
  autoColors: true,
  wordHighlight: true,
  arabicFontSize: autoFontSizes.portrait.arabic,
  translationFontSize: autoFontSizes.portrait.translation,
  fontStyle: 'quran',
  arabicFont: 'quran',
  bengaliFont: 'anek',
  useTajweed: false,
  showTranslation: true,
  showTransliteration: false,
  orientation: 'portrait',
  autoFitFonts: true,
  textWidth: 'wide',
  textSpacing: 'normal',
}
