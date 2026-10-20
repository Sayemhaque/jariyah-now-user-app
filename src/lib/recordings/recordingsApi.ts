import type { TextMode } from '@/lib/collections/types'
import type { StoredRecording } from './blobRecordings'

export async function fetchRecordings(mode: TextMode): Promise<StoredRecording[]> {
  const res = await fetch(`/api/recordings?mode=${mode}`, { cache: 'no-store' })
  if (!res.ok) return []
  return ((await res.json()) as { recordings?: StoredRecording[] }).recordings ?? []
}

export async function uploadRecording(mode: TextMode, itemId: string, file: Blob, uploadKey: string): Promise<StoredRecording> {
  const form = new FormData()
  form.set('mode', mode)
  form.set('itemId', itemId)
  form.set('file', file, `${itemId}`)
  const res = await fetch('/api/recordings', { method: 'POST', body: form, headers: { 'x-upload-key': uploadKey } })
  const json = (await res.json().catch(() => ({}))) as { recording?: StoredRecording; error?: string }
  if (!res.ok || !json.recording) throw new Error(json.error ?? `Upload failed (${res.status})`)
  return json.recording
}
