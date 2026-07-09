'use client'

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Surah,
  AyatData,
  VideoSettings,
  Reciter,
  Orientation,
} from './types'
import { RECITERS, DEFAULT_RECITER_ID } from './reciters'
import { validateAyatRange } from './validation'
import { AUTO_FONT_SIZES } from './types'
import { DEFAULT_TRANSLATION_KEY } from './translations'
import { SURAHS_FALLBACK } from './surahs-fallback'

export interface BuilderState {
  surahs: Surah[]
  selectedSurahNumber: number | null
  fromAyat: number
  toAyat: number
  reciterId: string
  translationKey: string
  settings: VideoSettings
  ayatList: AyatData[]
  loadingAyats: boolean
  ayatError: string | null
  setSurahs: (surahs: Surah[]) => void
  setSurah: (number: number) => void
  setFromAyat: (n: number) => void
  setToAyat: (n: number) => void
  setReciter: (id: string) => void
  setTranslation: (key: string) => void
  updateSettings: (patch: Partial<VideoSettings>) => void
  setOrientation: (o: Orientation) => void
  setAutoFitFonts: (on: boolean) => void
  setAyatLoading: (loading: boolean) => void
  setAyatError: (error: string | null) => void
  setAyatList: (list: AyatData[]) => void
  getReciter: () => Reciter
  getSelectedSurah: () => Surah | undefined
  getValidation: () => ReturnType<typeof validateAyatRange>
  getEstimatedDurationMs: () => number
}

const DEFAULT_SETTINGS: VideoSettings = {
  backgroundImage: '/backgrounds/twilight-mosque-portrait.png',
  backgroundPreset: 'twilight-mosque',
  overlayStyle: 'bottom-gradient',
  overlayColor: '#000000',
  overlayOpacity: 55,
  fontColor: '#ffffff',
  highlightColor: '#9333ea',
  arabicFontSize: AUTO_FONT_SIZES.portrait.arabic,
  translationFontSize: AUTO_FONT_SIZES.portrait.translation,
  fontStyle: 'uthmani',
  arabicFont: 'uthmani',
  bengaliFont: 'sans',
  useTajweed: false,
  showTranslation: true,
  showTransliteration: false,
  orientation: 'portrait',
  autoFitFonts: true,
  textWidth: 'wide',
  textSpacing: 'normal',
}

const TWILIGHT_MOSQUE_URLS: Record<string, string> = {
  portrait: '/backgrounds/twilight-mosque-portrait.png',
  landscape: '/backgrounds/twilight-mosque.png',
  square: '/backgrounds/twilight-mosque-square.png',
}

function pickBgForOrientation(
  currentPreset: string,
  currentBg: string,
  newOrientation: string,
): string {
  if (currentPreset !== 'twilight-mosque') return currentBg
  return TWILIGHT_MOSQUE_URLS[newOrientation] ?? currentBg
}

const BuilderContext = createContext<BuilderState | null>(null)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [surahs, setSurahs] = useState<Surah[]>(SURAHS_FALLBACK)
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null)
  const [fromAyat, setFromAyat] = useState(1)
  const [toAyat, setToAyat] = useState(3)
  const [reciterId, setReciterId] = useState(DEFAULT_RECITER_ID)
  const [translationKey, setTranslationKey] = useState(DEFAULT_TRANSLATION_KEY)
  const [settings, setSettings] = useState<VideoSettings>(DEFAULT_SETTINGS)
  const [ayatList, setAyatList] = useState<AyatData[]>([])
  const [loadingAyats, setAyatLoading] = useState(false)
  const [ayatError, setAyatError] = useState<string | null>(null)

  const setSurah = useCallback((number: number) => {
    const surah = surahs.find((s) => s.number === number)
    setSelectedSurahNumber(number)
    setFromAyat(1)
    setToAyat(Math.min(3, surah?.numberOfAyahs ?? 3))
    setAyatList([])
  }, [surahs])

  const setReciter = useCallback((id: string) => {
    setReciterId(id)
    setAyatList([])
  }, [])

  const setTranslation = useCallback((key: string) => {
    setTranslationKey(key)
    setAyatList([])
  }, [])

  const updateSettings = useCallback((patch: Partial<VideoSettings>) => {
    setSettings((current) => {
      const next: VideoSettings = { ...current, ...patch }
      if (
        patch.orientation &&
        patch.orientation !== current.orientation &&
        current.autoFitFonts
      ) {
        const auto = AUTO_FONT_SIZES[patch.orientation]
        next.arabicFontSize = auto.arabic
        next.translationFontSize = auto.translation
      }
      if (patch.orientation) {
        next.backgroundImage = pickBgForOrientation(
          current.backgroundPreset,
          current.backgroundImage,
          patch.orientation,
        )
      }
      return next
    })
  }, [])

  const setOrientation = useCallback((o: Orientation) => {
    setSettings((current) => {
      const patch: Partial<VideoSettings> = { orientation: o }
      if (current.autoFitFonts) {
        const auto = AUTO_FONT_SIZES[o]
        patch.arabicFontSize = auto.arabic
        patch.translationFontSize = auto.translation
      }
      patch.backgroundImage = pickBgForOrientation(
        current.backgroundPreset,
        current.backgroundImage,
        o,
      )
      return { ...current, ...patch }
    })
  }, [])

  const setAutoFitFonts = useCallback((on: boolean) => {
    setSettings((current) => {
      const patch: Partial<VideoSettings> = { autoFitFonts: on }
      if (on) {
        const auto = AUTO_FONT_SIZES[current.orientation]
        patch.arabicFontSize = auto.arabic
        patch.translationFontSize = auto.translation
      }
      return { ...current, ...patch }
    })
  }, [])

  const getReciter = useCallback(() => {
    return RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0]
  }, [reciterId])

  const getSelectedSurah = useCallback(() => {
    if (selectedSurahNumber == null) return undefined
    return surahs.find((s) => s.number === selectedSurahNumber)
  }, [selectedSurahNumber, surahs])

  const getValidation = useCallback(() => {
    return validateAyatRange(fromAyat, toAyat, getSelectedSurah())
  }, [fromAyat, toAyat, getSelectedSurah])

  const getEstimatedDurationMs = useCallback(() => {
    return ayatList.reduce((sum, a) => sum + (a.audioDurationMs || 0), 0)
  }, [ayatList])

  const value = useMemo<BuilderState>(() => ({
    surahs,
    selectedSurahNumber,
    fromAyat,
    toAyat,
    reciterId,
    translationKey,
    settings,
    ayatList,
    loadingAyats,
    ayatError,
    setSurahs,
    setSurah,
    setFromAyat,
    setToAyat,
    setReciter,
    setTranslation,
    updateSettings,
    setOrientation,
    setAutoFitFonts,
    setAyatLoading,
    setAyatError,
    setAyatList,
    getReciter,
    getSelectedSurah,
    getValidation,
    getEstimatedDurationMs,
  }), [
    surahs,
    selectedSurahNumber,
    fromAyat,
    toAyat,
    reciterId,
    translationKey,
    settings,
    ayatList,
    loadingAyats,
    ayatError,
    setSurah,
    setReciter,
    setTranslation,
    updateSettings,
    setOrientation,
    setAutoFitFonts,
    getReciter,
    getSelectedSurah,
    getValidation,
    getEstimatedDurationMs,
  ])

  return createElement(BuilderContext.Provider, { value }, children)
}

export function useBuilderStore<T>(selector: (state: BuilderState) => T): T {
  const context = useContext(BuilderContext)
  if (!context) {
    throw new Error('useBuilderStore must be used within BuilderProvider')
  }
  return selector(context)
}
