'use client'

import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ContentMode, TextLanguage } from './collections/types'
import type { CardFormat, CardLayout, CardTitleStyle } from './cards/types'
import { cardThemes } from './cards/themes'
import { defaultHadithSelection } from './hadith/hadithPicks'

export interface ContentState {
  mode: ContentMode
  presetId: string
  partIndex: number
  textItemId: string
  language: TextLanguage
  cardFormat: CardFormat
  cardThemeKey: string
  cardLayout: CardLayout
  titleStyle: CardTitleStyle
  titleGradient: boolean
  hadithBook: string
  hadithSection: number
  hadithNumber: number
  shortHadithOnly: boolean
  setMode: (mode: ContentMode) => void
  setPresetId: (id: string) => void
  setPartIndex: (index: number) => void
  setTextItemId: (id: string) => void
  setLanguage: (language: TextLanguage) => void
  setCardFormat: (format: CardFormat) => void
  setCardThemeKey: (key: string) => void
  setCardLayout: (layout: CardLayout) => void
  setTitleStyle: (style: CardTitleStyle) => void
  setTitleGradient: (on: boolean) => void
  setHadithBook: (book: string, section: number) => void
  setHadithSection: (section: number) => void
  setHadithNumber: (number: number) => void
  setShortHadithOnly: (on: boolean) => void
}

const ContentContext = createContext<ContentState | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ContentMode>('quran')
  const [presetId, setPresetIdState] = useState('')
  const [partIndex, setPartIndex] = useState(0)
  const [textItemId, setTextItemId] = useState('')
  const [language, setLanguage] = useState<TextLanguage>('english')
  const [cardFormat, setCardFormat] = useState<CardFormat>('portrait')
  const [cardThemeKey, setCardThemeKey] = useState(cardThemes[0]!.key)
  const [cardLayout, setCardLayout] = useState<CardLayout>('frame')
  const [titleStyle, setTitleStyle] = useState<CardTitleStyle>('serif')
  const [titleGradient, setTitleGradient] = useState(false)
  const [hadithBook, setHadithBookState] = useState(defaultHadithSelection.book)
  const [hadithSection, setHadithSectionState] = useState(defaultHadithSelection.section)
  const [hadithNumber, setHadithNumber] = useState(0)
  const [shortHadithOnly, setShortHadithOnly] = useState(true)

  const value = useMemo<ContentState>(() => ({
    mode, presetId, partIndex, textItemId, language, cardFormat, cardThemeKey, cardLayout, titleStyle, titleGradient, hadithBook, hadithSection, hadithNumber, shortHadithOnly,
    setMode: (next) => {
      setModeState(next)
      setPresetIdState('')
      setTextItemId('')
      setPartIndex(0)
    },
    setPresetId: (id) => {
      setPresetIdState(id)
      setPartIndex(0)
    },
    setPartIndex, setTextItemId, setLanguage, setCardFormat, setCardThemeKey, setCardLayout, setTitleStyle, setTitleGradient, setHadithNumber, setShortHadithOnly,
    setHadithBook: (book, section) => {
      setHadithBookState(book)
      setHadithSectionState(section)
      setHadithNumber(0)
    },
    setHadithSection: (section) => {
      setHadithSectionState(section)
      setHadithNumber(0)
    },
  }), [mode, presetId, partIndex, textItemId, language, cardFormat, cardThemeKey, cardLayout, titleStyle, titleGradient, hadithBook, hadithSection, hadithNumber, shortHadithOnly])

  return createElement(ContentContext.Provider, { value }, children)
}

export function useContent(): ContentState {
  const state = useContext(ContentContext)
  if (!state) throw new Error('useContent must be used inside ContentProvider')
  return state
}
