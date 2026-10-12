import { reciters } from '@/lib/reciters'
import { translationEditions } from '@/lib/translations'
import type { ContentBlock } from './richText'

export const aboutBlocks: ContentBlock[] = [
  { kind: 'p', text: 'Jariyah Now is a free tool for creating short recitation videos from the Quran. The name comes from **Sadaqah Jariyah** — the ongoing charity that keeps rewarding you long after the original act. Every reel you publish and share becomes a source of continuous reward: each view, each heart, each reshare counts. Pick a surah and ayat range, choose a reciter, customize the look, and export a video with Arabic text and a translation — ready to share.' },
  { kind: 'h2', text: 'Data sources' },
  { kind: 'p', text: 'Jariyah Now fetches its content from the following free, public APIs. We are grateful to the maintainers of these services.' },
  {
    kind: 'ul',
    items: [
      '[ummahapi.com](https://ummahapi.com) — Quran text (Uthmani script), translations across 12 languages, and reciter audio URLs. Serves as the primary text + translation source.',
      '[quran.com](https://quran.com) — Word-level timing data used to synchronize the Arabic text with the reciter audio. Also used (optionally) for Tajweed HTML.',
      '[everyayah.com](https://everyayah.com) — Reciter audio MP3s, hosted per-ayah for direct streaming.',
      '[Tanzil.net](https://tanzil.net) — The upstream source of the Uthmani text. We credit them as the canonical text provider.',
    ],
  },
  { kind: 'h2', text: 'Reciters' },
  { kind: 'p', text: `Jariyah Now offers ${reciters.length} reciters via UmmahAPI. We are deeply grateful to each of them and their estates for making these recitations available.` },
  { kind: 'ul', items: reciters.map((r) => `**${r.name}** {{${r.arabicName}}} — ${r.style} style. Audio from everyayah.com.`) },
  { kind: 'p', text: 'If you publish a video, please credit the reciter by name in the description. Non-commercial use with attribution is widely accepted; commercial use requires permission from the rights holder.' },
  { kind: 'h2', text: 'Translation editions' },
  { kind: 'p', text: `Jariyah Now lets you choose from ${translationEditions.length} translations across Bengali, English, Urdu, Turkish, Indonesian, French, German, Spanish, Malay, and Bosnian — all sourced from UmmahAPI. Each has its own license — pick the one that fits your use case.` },
  { kind: 'ul', items: translationEditions.map((e) => `**${e.label}** (${e.fullName}) — ${e.rightsHolder}.\n^^${e.licenseNote}^^`) },
  { kind: 'p', text: 'The default is **Bengali (Muhiuddin Khan)** so the app never ships with a copyright-restricted translation as the default. When a translation requires attribution, Jariyah Now automatically adds an attribution line to the bottom-left of the exported video.' },
  { kind: 'h2', text: 'Backgrounds' },
  { kind: 'p', text: 'The 6 animated backgrounds (Night & Gold, Emerald Sanctuary, Royal Amethyst, Midnight Aurora, Desert Dawn, Ocean Depth) are drawn by Jariyah Now itself, so there are no third-party images to license. You may also upload your own custom background — you are responsible for ensuring you have the rights to use it.' },
  { kind: 'h2', text: 'Fonts' },
  {
    kind: 'ul',
    items: [
      '**Inter** — UI text and English translation. SIL Open Font License.',
      '**Amiri** — Arabic, Uthmani style. SIL Open Font License.',
      '**Scheherazade New** — Arabic, Naskh style. SIL Open Font License.',
    ],
  },
  { kind: 'h2', text: 'Open source' },
  { kind: 'p', text: 'Jariyah Now\'s source code is MIT-licensed. See the [Terms of Service](/terms) and the LICENSE + NOTICES files in the repository for full licensing details.' },
  { kind: 'h2', text: 'Feedback' },
  { kind: 'p', text: 'Found a bug or have a feature request? Open an issue on the project repository. We welcome contributions.' },
]
