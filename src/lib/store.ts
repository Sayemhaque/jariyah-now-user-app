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
} from './types'
import { autoFontSizes, type Orientation } from './types'
import { reciters, defaultReciterId } from './reciters'
import { defaultTranslationKey } from './translations'
import { surahsFallback } from './surahs-fallback'
import { validateAyatRange } from './validation'

export interface SurahRangeSlice {
  surahs: Surah[]
  selectedSurahNumber: number | null
  fromAyat: number
  toAyat: number
  reciterId: string
  translationKey: string
  setSurahs: (surahs: Surah[]) => void
  setSurah: (number: number) => void
  setFromAyat: (n: number) => void
  setToAyat: (n: number) => void
  setReciter: (id: string) => void
  setTranslation: (key: string) => void
}

export interface SettingsSlice {
  settings: VideoSettings
  updateSettings: (patch: Partial<VideoSettings>) => void
  setOrientation: (o: Orientation) => void
  setAutoFitFonts: (on: boolean) => void
}

export interface AyatDataSlice {
  ayatList: AyatData[]
  loadingAyats: boolean
  ayatError: string | null
  setAyatLoading: (loading: boolean) => void
  setAyatError: (error: string | null) => void
  setAyatList: (list: AyatData[]) => void
}

const defaultSettings: VideoSettings = {
  backgroundImage: '/backgrounds/twilight-mosque-portrait.png',
  backgroundPreset: 'twilight-mosque',
  overlayStyle: 'bottom-gradient',
  overlayColor: '#000000',
  overlayOpacity: 55,
  fontColor: '#ffffff',
  highlightColor: '#9333ea',
  arabicFontSize: autoFontSizes.portrait.arabic,
  translationFontSize: autoFontSizes.portrait.translation,
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

const twilightMosqueUrls: Record<string, string> = {
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
  return twilightMosqueUrls[newOrientation] ?? currentBg
}

const SurahRangeContext = createContext<SurahRangeSlice | null>(null)
const SettingsContext = createContext<SettingsSlice | null>(null)
const AyatDataContext = createContext<AyatDataSlice | null>(null)

function SurahRangeProvider({ children }: { children: ReactNode }) {
  const [surahs, setSurahs] = useState<Surah[]>(surahsFallback)
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null)
  const [fromAyat, setFromAyat] = useState(1)
  const [toAyat, setToAyat] = useState(3)
  const [reciterId, setReciterId] = useState(defaultReciterId)
  const [translationKey, setTranslationKey] = useState(defaultTranslationKey)

  const setSurah = useCallback((number: number) => {
    const surah = surahs.find((s) => s.number === number)
    setSelectedSurahNumber(number)
    setFromAyat(1)
    setToAyat(Math.min(3, surah?.numberOfAyahs ?? 3))
  }, [surahs])

  const setReciter = useCallback((id: string) => {
    setReciterId(id)
  }, [])

  const setTranslation = useCallback((key: string) => {
    setTranslationKey(key)
  }, [])

  const value = useMemo<SurahRangeSlice>(() => ({
    surahs,
    selectedSurahNumber,
    fromAyat,
    toAyat,
    reciterId,
    translationKey,
    setSurahs,
    setSurah,
    setFromAyat,
    setToAyat,
    setReciter,
    setTranslation,
  }), [
    surahs,
    selectedSurahNumber,
    fromAyat,
    toAyat,
    reciterId,
    translationKey,
    setSurahs,
    setSurah,
    setFromAyat,
    setToAyat,
    setReciter,
    setTranslation,
  ])

  return createElement(SurahRangeContext.Provider, { value }, children)
}

function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<VideoSettings>(defaultSettings)

  const updateSettings = useCallback((patch: Partial<VideoSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch }
      if (
        patch.orientation &&
        patch.orientation !== current.orientation &&
        current.autoFitFonts
      ) {
        const auto = autoFontSizes[patch.orientation]
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
        const auto = autoFontSizes[o]
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
        const auto = autoFontSizes[current.orientation]
        patch.arabicFontSize = auto.arabic
        patch.translationFontSize = auto.translation
      }
      return { ...current, ...patch }
    })
  }, [])

  const value = useMemo<SettingsSlice>(() => ({
    settings,
    updateSettings,
    setOrientation,
    setAutoFitFonts,
  }), [
    settings,
    updateSettings,
    setOrientation,
    setAutoFitFonts,
  ])

  return createElement(SettingsContext.Provider, { value }, children)
}

function AyatDataProvider({ children }: { children: ReactNode }) {
  const [ayatList, setAyatList] = useState<AyatData[]>([])
  const [loadingAyats, setAyatLoading] = useState(false)
  const [ayatError, setAyatError] = useState<string | null>(null)

  const value = useMemo<AyatDataSlice>(() => ({
    ayatList,
    loadingAyats,
    ayatError,
    setAyatLoading,
    setAyatError,
    setAyatList,
  }), [
    ayatList,
    loadingAyats,
    ayatError,
    setAyatLoading,
    setAyatError,
    setAyatList,
  ])

  return createElement(AyatDataContext.Provider, { value }, children)
}

export function BuilderProvider({ children }: { children: ReactNode }) {
  return createElement(
    SurahRangeProvider,
    null,
    createElement(SettingsProvider, null, createElement(AyatDataProvider, null, children)),
  )
}

export function useSurahRange(): SurahRangeSlice {
  const ctx = useContext(SurahRangeContext)
  if (!ctx) throw new Error('useSurahRange must be used within BuilderProvider')
  return ctx
}

export function useSettings(): SettingsSlice {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within BuilderProvider')
  return ctx
}

export function useAyatData(): AyatDataSlice {
  const ctx = useContext(AyatDataContext)
  if (!ctx) throw new Error('useAyatData must be used within BuilderProvider')
  return ctx
}

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

export function useBuilderStore<T>(selector: (state: BuilderState) => T): T {
  const surahRange = useSurahRange()
  const settings = useSettings()
  const ayatData = useAyatData()
  const merged = useMemo<BuilderState>(() => {
    const reciter = reciters.find((r) => r.id === surahRange.reciterId) ?? reciters[0]
    const surah = surahRange.selectedSurahNumber == null
      ? undefined
      : surahRange.surahs.find((s) => s.number === surahRange.selectedSurahNumber)
    return {
      ...surahRange,
      ...settings,
      ...ayatData,
      getReciter: () => reciter,
      getSelectedSurah: () => surah,
      getValidation: () => validateAyatRange(
        surahRange.fromAyat,
        surahRange.toAyat,
        surah,
      ),
      getEstimatedDurationMs: () => ayatData.ayatList.reduce(
        (sum, a) => sum + (a.audioDurationMs || 0),
        0,
      ),
    }
  }, [surahRange, settings, ayatData])
  return selector(merged)
}
