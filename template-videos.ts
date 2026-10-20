import { appendFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { buildDailyPost } from '@/lib/daily/buildVideo'
import { getReciterById } from '@/lib/reciters'
import { makeReelSafe, renderStillFrame, renderVideo } from '@/lib/render/remotionRender'
import { readTemplateManifest, saveTemplateManifest, uploadTemplateFile } from '@/lib/templates/templateStore'
import { templateReciterId, templateThumbPath, templateVideoPath, videoTemplates, type TemplateManifestEntry, type VideoTemplate } from '@/lib/templates/videoTemplates'

const env = process.env
const thumbFrame = 90
const isDryRun = env.DRY_RUN === '1' || env.DRY_RUN === 'true'

function summary(line: string) {
  console.log(line)
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${line}\n`)
}

function selectTemplates(done: Set<string>): VideoTemplate[] {
  const only = (env.ONLY ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const force = env.FORCE === '1' || env.FORCE === 'true'
  const limit = Number(env.LIMIT) || Infinity
  return videoTemplates()
    .filter((t) => !only.length || only.some((o) => t.key === o || t.key.startsWith(`${o}/`) || t.presetId === o))
    .filter((t) => force || !done.has(t.key))
    .slice(0, limit)
}

async function renderTemplate(template: VideoTemplate, outDir: string, token: string | null): Promise<TemplateManifestEntry> {
  const reciterId = env.TEMPLATE_RECITER || templateReciterId
  const video = await buildDailyPost({
    surahOverride: template.surah,
    range: { fromAyat: template.fromAyat, toAyat: template.toAyat },
    reciterId,
    sceneKey: template.sceneKey,
    translationKey: env.TEMPLATE_TRANSLATION || 'sahiih_international',
    quality: '1080p',
    ffmpegBin: env.FFMPEG_BIN || 'ffmpeg',
  })
  if (video.kind !== 'video') throw new Error(`Expected a video for ${template.key}`)
  const name = template.key.replace('/', '-')
  const raw = join(outDir, `${name}-raw.mp4`)
  const mp4 = join(outDir, `${name}.mp4`)
  const jpg = join(outDir, `${name}.jpg`)
  await renderVideo(video.props, raw)
  makeReelSafe(raw, mp4)
  await renderStillFrame(video.props, thumbFrame, jpg)
  if (token) {
    await uploadTemplateFile(token, templateVideoPath(template.key), readFileSync(mp4), 'video/mp4')
    await uploadTemplateFile(token, templateThumbPath(template.key), readFileSync(jpg), 'image/jpeg')
    rmSync(mp4)
  }
  return { key: template.key, durationMs: video.durationMs, reciterName: getReciterById(reciterId)?.name ?? reciterId, renderedAt: new Date().toISOString() }
}

async function main() {
  const token = isDryRun ? null : env.BLOB_READ_WRITE_TOKEN ?? null
  if (!token && !isDryRun) throw new Error('BLOB_READ_WRITE_TOKEN is required to store template videos')
  const outDir = join(process.cwd(), 'out', 'templates')
  mkdirSync(outDir, { recursive: true })
  const manifest = new Map((token ? await readTemplateManifest(token) : []).map((e) => [e.key, e]))
  const queue = selectTemplates(new Set(manifest.keys()))
  summary(`## Template videos — ${queue.length} to render, ${manifest.size} already stored`)
  const failures: string[] = []
  for (const template of queue) {
    try {
      const entry = await renderTemplate(template, outDir, token)
      manifest.set(entry.key, entry)
      if (token) await saveTemplateManifest(token, [...manifest.values()])
      summary(`- ✅ ${template.key} (${(entry.durationMs / 1000).toFixed(1)}s)`)
    } catch (err) {
      failures.push(template.key)
      summary(`- ❌ ${template.key}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  if (failures.length) throw new Error(`Failed: ${failures.join(', ')}`)
}

main().catch((err) => {
  console.error('Template videos failed:', err)
  process.exit(1)
})
