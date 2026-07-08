/**
 * Tajweed color-coding helpers.
 *
 * The legacy quran.com API returns `text_uthmani_tajweed` — an HTML
 * string with <tajweed class="..."> tags marking specific Tajweed rules.
 * We parse this into colored text segments for rendering on both the
 * live preview (CSS) and the exported canvas (fillStyle).
 */

export interface TajweedSegment {
  text: string
  color: string | null  // null = use default font color
  class: string | null
}

const TAJWEED_COLORS: Record<string, string> = {
  madda_normal: '#5DC8E0',
  madda_obligatory: '#3F51B5',
  madda_permissible: '#2196F3',
  ikhafa: '#AAAAAA',
  idgham_ghunnah: '#00A000',
  idgham_wo_ghunnah: '#0000FF',
  ham_wasl: '#9E9E9E',
  laam_shamsiyah: '#9E9E9E',
  qalqalah: '#FF0000',
  iqlab: '#9C27B0',
}

export function parseTajweedHtml(html: string): TajweedSegment[] | null {
  if (!html || !html.includes('<tajweed')) return null

  const segments: TajweedSegment[] = []
  const regex = /<tajweed\s+class=["']?([\w_-]+)["']?\s*>([\s\S]*?)<\/tajweed>|<span\s+class=["']?end["']?\s*>[^<]*<\/span>|([^<]+)/g

  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    if (match[1] && match[2]) {
      const cls = match[1]
      const text = match[2]
      const color = TAJWEED_COLORS[cls] ?? null
      segments.push({ text, color, class: cls })
    } else if (match[3]) {
      const text = match[3]
      if (text.trim()) {
        segments.push({ text, color: null, class: null })
      }
    }
  }
  return segments.length > 0 ? segments : null
}
