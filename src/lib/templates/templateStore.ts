import { head, put } from '@vercel/blob'
import { presignedBlobUrl } from '@/lib/blobUrls'
import { templateManifestPath, type TemplateManifestEntry } from './videoTemplates'

const readLinkMs = 5 * 60 * 1000

async function exists(pathname: string, token: string): Promise<boolean> {
  return head(pathname, { token }).then(() => true, () => false)
}

export async function readTemplateManifest(token: string): Promise<TemplateManifestEntry[]> {
  if (!(await exists(templateManifestPath, token))) return []
  const res = await fetch(await presignedBlobUrl(templateManifestPath, token, readLinkMs), { cache: 'no-store' })
  if (!res.ok) return []
  const json = (await res.json()) as { videos?: TemplateManifestEntry[] }
  return json.videos ?? []
}

export async function saveTemplateManifest(token: string, videos: TemplateManifestEntry[]): Promise<void> {
  const body = JSON.stringify({ videos }, null, 2)
  await put(templateManifestPath, body, { access: 'private', contentType: 'application/json', token, addRandomSuffix: false, allowOverwrite: true })
}

export async function uploadTemplateFile(token: string, pathname: string, data: Buffer, contentType: string): Promise<void> {
  await put(pathname, data, { access: 'private', contentType, token, addRandomSuffix: false, allowOverwrite: true })
}
