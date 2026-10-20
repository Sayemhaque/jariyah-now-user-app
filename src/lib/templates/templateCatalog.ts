import { presignedBlobUrl } from '@/lib/blobUrls'
import { readTemplateManifest } from './templateStore'
import { findVideoTemplate, templateReference, templateThumbPath, templateVideoPath, type VideoTemplate } from './videoTemplates'

const linkLifetimeMs = 60 * 60 * 1000

export interface PublishedTemplate extends VideoTemplate {
  reference: string
  durationMs: number
  reciterName: string
  thumbUrl: string
  previewUrl: string
  downloadUrl: string
}

export async function publishedTemplates(token: string): Promise<PublishedTemplate[]> {
  const manifest = await readTemplateManifest(token)
  const entries = manifest.flatMap((entry) => {
    const template = findVideoTemplate(entry.key)
    return template ? [{ entry, template }] : []
  })
  return Promise.all(
    entries.map(async ({ entry, template }) => ({
      ...template,
      reference: templateReference(template),
      durationMs: entry.durationMs,
      reciterName: entry.reciterName,
      thumbUrl: await presignedBlobUrl(templateThumbPath(template.key), token, linkLifetimeMs),
      previewUrl: await presignedBlobUrl(templateVideoPath(template.key), token, linkLifetimeMs),
      downloadUrl: `/api/templates/download?key=${encodeURIComponent(template.key)}`,
    })),
  )
}
