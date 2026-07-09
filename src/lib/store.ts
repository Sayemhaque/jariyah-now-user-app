'use client'

import { create } from 'zustand'
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

interface BuilderState {
  // data
  surahs: Surah[]
  selectedSurahNumber: number | null
  fromAyat: number
  toAyat: number
  reciterId: string
  /** UmmahAPI translation key (e.g. bengali). See lib/translations.ts. */
  translationKey: string
  settings: VideoSettings

  ayatList: AyatData[]
  loadingAyats: boolean
  ayatError: string | null

  // actions
  setSurahs: (surahs: Surah[]) => void
  setSurah: (number: number) => void
  setFromAyat: (n: number) => void
  setToAyat: (n: number) => void
  setReciter: (id: string) => void
  setTranslation: (key: string) => void
  updateSettings: (patch: Partial<VideoSettings>) => void
  /** Convenience: change orientation (and auto-fit fonts when enabled). */
  setOrientation: (o: Orientation) => void
  /** Toggle the auto-fit flag. When turning on, immediately applies the
   *  auto font sizes for the current orientation. */
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

/**
 * The Twilight Mosque brand theme has 3 orientation-specific variants.
 * When the user has the Twilight Mosque preset selected and switches
 * orientation, we auto-swap to the matching variant so the background
 * always fits the composition cleanly.
 */
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

export const useBuilderStore = create<BuilderState>((set, get) => ({
  // Initialize with the bundled fallback so the dropdown is immediately
  // populated on first render — no loading spinner. TanStack Query will
  // fetch the live list from UmmahAPI and update it if it's
  // richer (e.g. slightly different Arabic names), but the UI is already
  // interactive before that resolves.
  surahs: SURAHS_FALLBACK,
  selectedSurahNumber: null,
  fromAyat: 1,
  toAyat: 3,
  reciterId: DEFAULT_RECITER_ID,
  translationKey: DEFAULT_TRANSLATION_KEY,
  settings: DEFAULT_SETTINGS,

  ayatList: [],
  loadingAyats: false,
  ayatError: null,

  setSurahs: (surahs) => set({ surahs }),

  setSurah: (number) => {
    const surah = get().surahs.find((s) => s.number === number)
    set({
      selectedSurahNumber: number,
      fromAyat: 1,
      toAyat: Math.min(3, surah?.numberOfAyahs ?? 3),
      ayatList: [],
    })
  },

  setFromAyat: (n) => set({ fromAyat: n }),
  setToAyat: (n) => set({ toAyat: n }),
  setReciter: (id) => {
    set({ reciterId: id, ayatList: [] })
  },
  setTranslation: (key) => {
    // Changing translation clears the current list so the next TanStack Query
    // load uses the newly selected edition.
    set({ translationKey: key, ayatList: [] })
  },

  updateSettings: (patch) =>
    set((state) => {
      // If the orientation is changing AND auto-fit is on, also apply the
      // auto font sizes for the new orientation. This is what makes the
      // fonts "auto responsive" when the user picks a different layout.
      const next: VideoSettings = { ...state.settings, ...patch }
      if (
        patch.orientation &&
        patch.orientation !== state.settings.orientation &&
        state.settings.autoFitFonts
      ) {
        const auto = AUTO_FONT_SIZES[patch.orientation]
        next.arabicFontSize = auto.arabic
        next.translationFontSize = auto.translation
      }
      // When the orientation changes, also swap to the matching Twilight
      // Mosque variant (if that preset is selected) so the background always
      // fits the new aspect ratio cleanly.
      if (patch.orientation) {
        next.backgroundImage = pickBgForOrientation(
          state.settings.backgroundPreset,
          state.settings.backgroundImage,
          patch.orientation,
        )
      }
      return { settings: next }
    }),

  setOrientation: (o) => {
    const state = get()
    const patch: Partial<VideoSettings> = { orientation: o }
    if (state.settings.autoFitFonts) {
      const auto = AUTO_FONT_SIZES[o]
      patch.arabicFontSize = auto.arabic
      patch.translationFontSize = auto.translation
    }
    // Swap to the matching Twilight Mosque variant (if that preset is
    // selected) so the background always fits the new aspect ratio cleanly.
    patch.backgroundImage = pickBgForOrientation(
      state.settings.backgroundPreset,
      state.settings.backgroundImage,
      o,
    )
    set((s) => ({ settings: { ...s.settings, ...patch } }))
  },

  setAutoFitFonts: (on) => {
    const state = get()
    const patch: Partial<VideoSettings> = { autoFitFonts: on }
    if (on) {
      // Immediately apply the auto font sizes for the current orientation.
      const auto = AUTO_FONT_SIZES[state.settings.orientation]
      patch.arabicFontSize = auto.arabic
      patch.translationFontSize = auto.translation
    }
    set((s) => ({ settings: { ...s.settings, ...patch } }))
  },

  setAyatLoading: (loading) => set({ loadingAyats: loading }),
  setAyatError: (error) => set({ ayatError: error }),
  setAyatList: (list) => set({ ayatList: list }),

  getReciter: () => {
    const id = get().reciterId
    return RECITERS.find((r) => r.id === id) ?? RECITERS[0]
  },

  getSelectedSurah: () => {
    const n = get().selectedSurahNumber
    if (n == null) return undefined
    return get().surahs.find((s) => s.number === n)
  },

  getValidation: () => {
    const surah = get().getSelectedSurah()
    return validateAyatRange(get().fromAyat, get().toAyat, surah)
  },

  getEstimatedDurationMs: () => {
    const list = get().ayatList
    return list.reduce((sum, a) => sum + (a.audioDurationMs || 0), 0)
  },
}))
