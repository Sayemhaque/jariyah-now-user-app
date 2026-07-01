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
import { fetchSurahs, fetchAyatData, getAudioDurationMs } from './quranApi'
import { validateAyatRange } from './validation'
import { AUTO_FONT_SIZES } from './types'
import { DEFAULT_TRANSLATION_KEY } from './translations'

interface BuilderState {
  // data
  surahs: Surah[]
  surahsLoading: boolean
  surahsError: string | null
  selectedSurahNumber: number | null
  fromAyat: number
  toAyat: number
  reciterId: string
  /** alquran.cloud edition key (e.g. en.pickthall). See lib/translations.ts. */
  translationKey: string
  settings: VideoSettings

  // fetched ayat data — keyed by "surah:ayat:translationKey"
  ayatCache: Record<string, AyatData>
  ayatList: AyatData[]
  loadingAyats: boolean
  ayatError: string | null

  // actions
  loadSurahs: () => Promise<void>
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
  fetchRange: () => Promise<void>
  getReciter: () => Reciter
  getSelectedSurah: () => Surah | undefined
  getValidation: () => ReturnType<typeof validateAyatRange>
  getEstimatedDurationMs: () => number
}

const DEFAULT_SETTINGS: VideoSettings = {
  backgroundImage: '/backgrounds/mosque.png',
  backgroundPreset: 'mosque',
  overlayStyle: 'bottom-gradient',
  overlayColor: '#000000',
  overlayOpacity: 55,
  fontColor: '#ffffff',
  highlightColor: '#F5A623',
  arabicFontSize: AUTO_FONT_SIZES.portrait.arabic,
  translationFontSize: AUTO_FONT_SIZES.portrait.translation,
  fontStyle: 'uthmani',
  showTranslation: true,
  showTransliteration: false,
  orientation: 'portrait',
  autoFitFonts: true,
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  surahs: [],
  surahsLoading: false,
  surahsError: null,
  selectedSurahNumber: null,
  fromAyat: 1,
  toAyat: 3,
  reciterId: DEFAULT_RECITER_ID,
  translationKey: DEFAULT_TRANSLATION_KEY,
  settings: DEFAULT_SETTINGS,

  ayatCache: {},
  ayatList: [],
  loadingAyats: false,
  ayatError: null,

  loadSurahs: async () => {
    if (get().surahs.length) return
    set({ surahsLoading: true, surahsError: null })
    try {
      const surahs = await fetchSurahs()
      set({ surahs, surahsLoading: false })
    } catch (err) {
      set({
        surahsLoading: false,
        surahsError: err instanceof Error ? err.message : 'Failed to load surahs',
      })
    }
  },

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
    // changing reciter invalidates cached word timings + audio urls
    set({ reciterId: id, ayatList: [], ayatCache: {} })
  },
  setTranslation: (key) => {
    // changing translation invalidates the cache (the translation text differs
    // per edition) but keeps the reciter (audio + word timings are unaffected)
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

  fetchRange: async () => {
    const state = get()
    const surah = state.getSelectedSurah()
    if (!surah) {
      set({ ayatError: 'Please select a surah first' })
      return
    }
    const v = validateAyatRange(state.fromAyat, state.toAyat, surah)
    if (!v.ok) {
      set({ ayatError: v.error ?? 'Invalid ayat range' })
      return
    }
    const reciter = state.getReciter()
    const translationKey = state.translationKey
    set({ loadingAyats: true, ayatError: null, ayatList: [] })

    try {
      const list: AyatData[] = []
      for (let ayat = state.fromAyat; ayat <= state.toAyat; ayat++) {
        // Cache key includes the translation edition so switching editions
        // re-fetches the translation text while still benefiting from the
        // cache for repeated loads of the same edition.
        const key = `${surah.number}:${ayat}:${translationKey}`
        let data = state.ayatCache[key]
        if (!data) {
          data = await fetchAyatData(
            surah.number,
            ayat,
            reciter.recitationId,
            reciter.audioKey,
            surah.name,
            surah.arabicName,
            translationKey,
          )
          if (data) {
            // resolve audio duration (best effort)
            const dur = await getAudioDurationMs(data.audioUrl)
            data.audioDurationMs = dur
            set((s) => ({
              ayatCache: { ...s.ayatCache, [key]: data! },
            }))
          }
        }
        if (data) list.push(data)
      }
      if (!list.length) {
        set({
          loadingAyats: false,
          ayatError: 'Could not load ayat data. Check your connection and try again.',
        })
        return
      }
      set({ ayatList: list, loadingAyats: false })
    } catch (err) {
      set({
        loadingAyats: false,
        ayatError:
          err instanceof Error ? err.message : 'Failed to load ayat data',
      })
    }
  },
}))
