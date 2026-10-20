import type { TextMode } from '@/lib/collections/types'

export const recordingsPrefix = 'recordings/'
export const maxRecordingBytes = 4 * 1024 * 1024

const extensions: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
}

export interface RecordingKey {
  mode: TextMode
  itemId: string
}

export function audioExtension(contentType: string): string | null {
  return extensions[contentType.split(';')[0]!.trim().toLowerCase()] ?? null
}

const safeId = /^[a-z0-9-]{1,60}$/

export function recordingPath(mode: TextMode, itemId: string, extension: string): string {
  if (!safeId.test(itemId)) throw new Error('Invalid item id')
  return `${recordingsPrefix}${mode}/${itemId}.${extension}`
}

export function parseRecordingPath(pathname: string): RecordingKey | null {
  const match = /^recordings\/(hadith|azkar)\/([a-z0-9-]{1,60})\.[a-z0-9]+$/.exec(pathname)
  return match ? { mode: match[1] as TextMode, itemId: match[2]! } : null
}
