import { textCollections } from '@/lib/collections'
import { isPresetMode, type ContentMode } from '@/lib/collections/types'
import { azkarCard, fridayCard, hadithCard, quranCards } from '@/lib/cards/cardContent'
import { fridayItems, type FridayPostKey } from '@/lib/collections/friday'
import { cardPostMetadata } from '@/lib/cards/cardPostMetadata'
import { fetchCardAyat } from '@/lib/cards/fetchCardAyat'
import { isBanglaTranslation, presetCardTitle } from '@/lib/cards/presetTitle'
import { presetBenefits } from '@/lib/collections/benefits'
import { templateAt, templateCount, titleStyleFor } from '@/lib/cards/templates'
import type { CardContent } from '@/lib/cards/types'
import { fetchSurahs } from '@/lib/quranApi'
import { translationCredit } from '@/lib/translations'
import type { DailyContext, DailyImagePost } from './dailyContext'
import { dhakaDateKey, mulberry32 } from './plan'
import { pickFrom, pickHadithSource, pickPreset, pickTextItem } from './planContent'
import { fetchHadithSection } from '@/lib/hadith/hadithApi'
import { shareableHadiths } from '@/lib/hadith/hadithPicks'

const maxCarouselSlides = 10

function pickTemplate(sequence: number) {
  return templateAt(Math.floor(mulberry32(0xca7d + sequence)() * templateCount))
}

async function presetCards(ctx: DailyContext, mode: 'masnoon' | 'duas', turn: number): Promise<CardContent[]> {
  const { preset, part } = pickPreset(mode, turn)
  const translationKey = ctx.opts.translationKey ?? 'sahiih_international'
  const [surahs, ayat] = await Promise.all([fetchSurahs(), fetchCardAyat(preset.surah, part.fromAyat, part.toAyat, translationKey)])
  const surah = surahs.find((s) => s.number === preset.surah)
  if (!surah) throw new Error(`Surah ${preset.surah} not found`)
  const bangla = isBanglaTranslation(translationKey)
  const title = presetCardTitle(mode, preset, surah.name, bangla)
  return quranCards({ bangla, benefit: presetBenefits[preset.id], kind: mode === 'duas' ? 'dua' : 'masnoon', title, surahName: surah.name, surahNameArabic: surah.arabicName, surahNumber: surah.number, ayat }, 'portrait').slice(0, maxCarouselSlides)
}

const hadithAttempts = 6

async function hadithCards(ctx: DailyContext, turn: number): Promise<CardContent[]> {
  const language = ctx.opts.textLanguage ?? 'english'
  for (let attempt = 0; attempt < hadithAttempts; attempt++) {
    const { book, section } = pickHadithSource(turn, attempt)
    const hadith = pickFrom(shareableHadiths(await fetchHadithSection(book, language, section).catch(() => [])), turn)
    if (hadith) return [hadithCard(hadith)]
  }
  throw new Error('Could not find a short authentic hadith to post')
}

function azkarCards(ctx: DailyContext, turn: number): CardContent[] {
  return [azkarCard(pickTextItem(textCollections.azkar, turn), ctx.opts.textLanguage ?? 'english')]
}

export const isFridayKey = (mode: string): mode is FridayPostKey => mode in fridayItems

export function buildFridayPost(ctx: DailyContext, key: FridayPostKey): DailyImagePost {
  return imagePost(ctx, key, [fridayCard(fridayItems[key])])
}

export async function buildImagePost(ctx: DailyContext, mode: Exclude<ContentMode, 'quran'>, turn: number): Promise<DailyImagePost> {
  const contents = isPresetMode(mode) ? await presetCards(ctx, mode, turn) : mode === 'hadith' ? await hadithCards(ctx, turn) : azkarCards(ctx, turn)
  const credit = isPresetMode(mode) ? translationCredit(ctx.opts.translationKey ?? 'sahiih_international') : undefined
  return imagePost(ctx, mode, contents, credit)
}

function imagePost(ctx: DailyContext, mode: DailyImagePost['mode'], contents: CardContent[], credit?: string): DailyImagePost {
  const template = pickTemplate(ctx.sequence)
  return {
    kind: 'images',
    dateKey: dhakaDateKey(ctx.now),
    mode,
    label: `${contents[0]!.eyebrow}: ${contents[0]!.title} · ${contents[0]!.reference} · ${contents.length} image${contents.length > 1 ? 's' : ''} · ${template.label}`,
    cards: contents.map((content) => ({ content, theme: template.theme, layout: template.layout, variant: template.variant, ...titleStyleFor(ctx.sequence), format: 'portrait' })),
    meta: cardPostMetadata(contents, ctx.opts.extraHashtags, credit),
  }
}
