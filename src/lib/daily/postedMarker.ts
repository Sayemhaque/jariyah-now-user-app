import { list, put } from '@vercel/blob'

const markerPath = (slot: Date) => `daily-posted/${slot.toISOString().replace(/[:.]/g, '-')}.txt`

export async function isSlotPosted(slot: Date, token: string): Promise<boolean> {
  const { blobs } = await list({ prefix: markerPath(slot), limit: 1, token })
  return blobs.length > 0
}

export async function markSlotPosted(slot: Date, token: string, note: string): Promise<void> {
  try {
    await put(markerPath(slot), note, { access: 'private', contentType: 'text/plain', token, addRandomSuffix: false })
  } catch (error) {
    console.warn('[posted marker] not saved:', error instanceof Error ? error.message : error)
  }
}
