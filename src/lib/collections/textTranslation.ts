import type { TextItem, TextLanguage } from './types'

export const textTranslation = (item: TextItem, language: TextLanguage) => (language === 'bangla' ? item.bangla : item.english)
