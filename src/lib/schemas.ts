import { z } from 'zod'
import { isAllowedAudioUrl } from './urlAllowlist'

/**
 * Zod schemas for every API route's input. The client validates too, but the
 * server never trusts the client — someone can hit the route directly with
 * curl. These schemas are the single source of truth for what each endpoint
 * accepts.
 *
 * Usage in a route handler:
 *   const parsed = renderBodySchema.safeParse(await req.json())
 *   if (!parsed.success) return NextResponse.json({ error: ... }, { status: 400 })
 *   const body = parsed.data  // fully typed
 */

// --- Shared primitives -------------------------------------------------

export const surahNumberSchema = z
  .number()
  .int('Surah number must be an integer')
  .min(1, 'Surah number must be at least 1')
  .max(114, 'Surah number must be at most 114')

export const ayatNumberSchema = z
  .number()
  .int('Ayat number must be an integer')
  .min(1, 'Ayat number must be at least 1')

// --- POST /api/render ---------------------------------------------------

const MAX_AYATS_PER_VIDEO = 10

const slideSchema = z.object({
  arabicText: z.string().min(1),
  translation: z.string(),
  transliteration: z.string().optional().default(''),
  surahName: z.string(),
  surahNameArabic: z.string(),
  ayatNumber: ayatNumberSchema,
  surahNumber: surahNumberSchema,
  audioUrl: z
    .string()
    .url()
    .refine(isAllowedAudioUrl, {
      message:
        'audioUrl must be an HTTPS URL on the allowed audio CDN (everyayah.com or verses.quran.com)',
    }),
  audioDurationMs: z.number().min(0),
})

const overlayStyleSchema = z.enum([
  'solid',
  'bottom-gradient',
  'top-gradient',
  'vignette',
  'center-focus',
  'none',
])

const orientationSchema = z.enum(['landscape', 'portrait'])

const fontStyleSchema = z.enum(['uthmani', 'naskh'])

const settingsSchema = z.object({
  backgroundImage: z.string().min(1),
  backgroundPreset: z.string(),
  overlayStyle: overlayStyleSchema,
  overlayColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'overlayColor must be a #rrggbb hex'),
  overlayOpacity: z.number().min(0).max(80),
  fontColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'fontColor must be a #rrggbb hex'),
  highlightColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'highlightColor must be a #rrggbb hex'),
  arabicFontSize: z.number().min(24).max(72),
  translationFontSize: z.number().min(14).max(32),
  fontStyle: fontStyleSchema,
  showTranslation: z.boolean(),
  showTransliteration: z.boolean(),
  orientation: orientationSchema,
  autoFitFonts: z.boolean(),
})

export const renderBodySchema = z.object({
  slides: z.array(slideSchema).min(1, 'At least one slide is required').max(
    MAX_AYATS_PER_VIDEO,
    `Too many slides: max ${MAX_AYATS_PER_VIDEO} ayats per video`,
  ),
  reciterKey: z.string().min(1, 'reciterKey is required'),
  settings: settingsSchema,
  orientation: orientationSchema,
})

export type RenderBody = z.infer<typeof renderBodySchema>

// --- PUT /api/render (progress update) ---------------------------------

export const renderUpdateBodySchema = z.object({
  jobId: z.string().min(1),
  status: z.enum(['rendering', 'done', 'error']).optional(),
  progress: z.number().min(0).max(1).optional(),
  downloadUrl: z.string().optional(),
  error: z.string().optional(),
})

export type RenderUpdateBody = z.infer<typeof renderUpdateBodySchema>

// --- GET /api/render-status --------------------------------------------

export const renderStatusQuerySchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
})

export type RenderStatusQuery = z.infer<typeof renderStatusQuerySchema>
