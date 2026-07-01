'use client'

import { create } from 'zustand'
import type {
  Surah,
  AyatData,
  VideoSettings,
  Reciter,
} from './types'
import { RECITERS, DEFAULT_RECITER_ID } from './reciters'
import { fetchSurahs, fetchAyatData, getAudioDurationMs } from './quranApi'
import { validateAyatRange } from './validation'

interface BuilderState {
  // data
  surahs: Surah[]
  surahsLoading: boolean
  surahsError: string | null
  selectedSurahNumber: number | null
  fromAyat: number
  toAyat: number
  reciterId: string
  settings: VideoSettings

  // fetched ayat data — keyed by "surah:ayat"
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
  updateSettings: (patch: Partial<VideoSettings>) => void
  fetchRange: () => Promise<void>
  getReciter: () => Reciter
  getSelectedSurah: () => Surah | undefined
  getValidation: () => ReturnType<typeof validateAyatRange>
  getEstimatedDurationMs: () => number
}

const DEFAULT_SETTINGS: VideoSettings = {
  backgroundImage: '/backgrounds/mountain.svg',
  backgroundPreset: 'mountain',
  overlayColor: '#000000',
  overlayOpacity: 50,
  fontColor: '#ffffff',
  highlightColor: '#F5A623',
  arabicFontSize: 48,
  translationFontSize: 20,
  fontStyle: 'uthmani',
  showBorder: true,
  borderColor: '#F5A623',
  border_radius: 16,
  showTranslation: true,
  showTransliteration: false,
  orientation: 'portrait',
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  surahs: [],
  surahsLoading: false,
  surahsError: null,
  selectedSurahNumber: null,
  fromAyat: 1,
  toAyat: 3,
  reciterId: DEFAULT_RECITER_ID,
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
    } catch (e: any) {
      set({ surahsLoading: false, surahsError: e?.message ?? 'Failed to load surahs' })
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

  updateSettings: (patch) =>
    set((state) => ({ settings: { ...state.settings, ...patch } })),

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
    set({ loadingAyats: true, ayatError: null, ayatList: [] })

    try {
      const list: AyatData[] = []
      for (let ayat = state.fromAyat; ayat <= state.toAyat; ayat++) {
        const key = `${surah.number}:${ayat}`
        let data = state.ayatCache[key]
        if (!data) {
          data = await fetchAyatData(
            surah.number,
            ayat,
            reciter.recitationId,
            reciter.audioKey,
            surah.name,
            surah.arabicName,
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
    } catch (e: any) {
      set({
        loadingAyats: false,
        ayatError: e?.message ?? 'Failed to load ayat data',
      })
    }
  },
}))
