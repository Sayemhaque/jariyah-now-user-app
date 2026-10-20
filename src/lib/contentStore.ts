'use client'

import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ContentMode, TextItem, TextLanguage, TextMode } from './collections/types'

export interface LoadedText {
  mode: TextMode
  item: TextItem
  language: TextLanguage
}

export interface ContentState {
  mode: ContentMode
  presetId: string
  partIndex: number
  textItemId: string
  language: TextLanguage
  loadedText: LoadedText | null
  setMode: (mode: ContentMode) => void
  setPresetId: (id: string) => void
  setPartIndex: (index: number) => void
  setTextItemId: (id: string) => void
  setLanguage: (language: TextLanguage) => void
  setLoadedText: (loaded: LoadedText | null) => void
}

const ContentContext = createContext<ContentState | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ContentMode>('quran')
  const [presetId, setPresetIdState] = useState('')
  const [partIndex, setPartIndex] = useState(0)
  const [textItemId, setTextItemId] = useState('')
  const [language, setLanguage] = useState<TextLanguage>('english')
  const [loadedText, setLoadedText] = useState<LoadedText | null>(null)

  const value = useMemo<ContentState>(() => ({
    mode, presetId, partIndex, textItemId, language, loadedText,
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
    setPartIndex, setTextItemId, setLanguage, setLoadedText,
  }), [mode, presetId, partIndex, textItemId, language, loadedText])

  return createElement(ContentContext.Provider, { value }, children)
}

export function useContent(): ContentState {
  const state = useContext(ContentContext)
  if (!state) throw new Error('useContent must be used inside ContentProvider')
  return state
}
