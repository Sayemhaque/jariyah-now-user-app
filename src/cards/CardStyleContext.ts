import { createContext, useContext } from 'react'
import type { CardTitleStyle } from '@/lib/cards/types'

export interface CardStyle {
  titleStyle: CardTitleStyle
  titleGradient: boolean
}

export const CardStyleContext = createContext<CardStyle>({ titleStyle: 'serif', titleGradient: false })

export const useCardStyle = () => useContext(CardStyleContext)
