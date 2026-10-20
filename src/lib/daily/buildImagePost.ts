import { textCollections } from '@/lib/collections'
import { isPresetMode, type ContentMode } from '@/lib/collections/types'
import { azkarCard, hadithCard, quranCards } from '@/lib/cards/cardContent'
import { cardPostMetadata } from '@/lib/cards/cardPostMetadata'
import { fetchCardAyat } from '@/lib/cards/fetchCardAyat'
import { cardThemes } from '@/lib/cards/themes'
import type { CardContent } from '@/lib/cards/types'
import { fetchSurahs } from '@/lib/quranApi'
import { translationCredit } from '@/lib/translations'
import type { DailyContext, DailyImagePost } from './dailyContext'
import { dhakaDateKey, seededShuffle } from './plan'
import { pickPreset, pickTextItem } from './planContent'

const maxCarouselSlides = 10

function pickTheme(sequence: number) {
  const order = seededShuffle(cardThemes, 0xca7d + Math.floor(sequence / cardThemes.length))
  return order[((sequence % cardThemes.length) + cardThemes.length) % cardThemes.length]!
}

async function presetCards(ctx: DailyContext, mode: 'masnoon' | 'duas', turn: number): Promise<CardContent[]> {
  const { preset, part } = pickPreset(mode, turn)
  const translationKey = ctx.opts.translationKey ?? 'sahiih_international'
  const [surahs, ayat] = await Promise.all([fetchSurahs(), fetchCardAyat(preset.surah, part.fromAyat, part.toAyat, translationKey)])
  const surah = surahs.find((s) => s.number === preset.surah)
  if (!surah) throw new Error(`Surah ${preset.surah} not found`)
  const title = mode === 'duas' ? preset.title : surah.name
  return quranCards({ kind: mode === 'duas' ? 'dua' : 'masnoon', title, surahName: surah.name, surahNameArabic: surah.arabicName, surahNumber: surah.number, ayat }, 'portrait').slice(0, maxCarouselSlides)
}

function textCards(ctx: DailyContext, mode: 'hadith' | 'azkar', turn: number): CardContent[] {
  const item = pickTextItem(textCollections[mode], turn)
  const language = ctx.opts.textLanguage ?? 'english'
  return [mode === 'hadith' ? hadithCard(item, language) : azkarCard(item, language)]
}

export async function buildImagePost(ctx: DailyContext, mode: Exclude<ContentMode, 'quran'>, turn: number): Promise<DailyImagePost> {
  const contents = isPresetMode(mode) ? await presetCards(ctx, mode, turn) : textCards(ctx, mode, turn)
  const theme = pickTheme(ctx.sequence)
  const credit = isPresetMode(mode) ? translationCredit(ctx.opts.translationKey ?? 'sahiih_international') : undefined
  return {
    kind: 'images',
    dateKey: dhakaDateKey(ctx.now),
    mode,
    label: `${contents[0]!.eyebrow}: ${contents[0]!.title} · ${contents[0]!.reference} · ${contents.length} image${contents.length > 1 ? 's' : ''} · ${theme.label}`,
    cards: contents.map((content) => ({ content, theme, format: 'portrait' })),
    meta: cardPostMetadata(contents, ctx.opts.extraHashtags, credit),
  }
}
