import { createContext, useContext } from 'react'
import type { CardFormat, CardTitleStyle } from '@/lib/cards/types'

export interface CardStyle {
  titleStyle: CardTitleStyle
  titleGradient: boolean
  format: CardFormat
}

export const CardStyleContext = createContext<CardStyle>({ titleStyle: 'serif', titleGradient: false, format: 'portrait' })

export const useCardStyle = () => useContext(CardStyleContext)
