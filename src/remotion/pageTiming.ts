import { Easing, interpolate } from 'remotion'
import type { WordWindow } from '@/lib/wordTiming'
import type { PageRange } from './pages'

export const pageLeadMs = 350
const fadeOutMs = 320
const fadeInMs = 520

const eased = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) } as const

export function pageSwitchTimes(words: WordWindow[], pages: PageRange[]): number[] {
  return pages.map((page, index) => (index === 0 ? -Infinity : (words[page.start]?.startMs ?? 0) - pageLeadMs))
}

export function pageState(switches: number[], timeMs: number) {
  let index = 0
  while (index + 1 < switches.length && timeMs >= switches[index + 1]!) index++
  const next = switches[index + 1]
  const fadeOut = next === undefined ? 1 : interpolate(next - timeMs, [0, fadeOutMs], [0, 1], eased)
  const fadeIn = index === 0 ? 1 : interpolate(timeMs - switches[index]!, [0, fadeInMs], [0, 1], eased)
  return { index, opacity: Math.min(fadeIn, fadeOut), shift: fadeIn < 1 ? 1 - fadeIn : fadeOut - 1 }
}
