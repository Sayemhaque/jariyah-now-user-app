import { issueSignedToken, presignUrl } from '@vercel/blob'

export async function presignedBlobUrl(pathname: string, token: string, lifetimeMs: number): Promise<string> {
  const validUntil = Date.now() + lifetimeMs
  const signed = await issueSignedToken({ token, pathname, operations: ['get'], validUntil })
  const { presignedUrl } = await presignUrl(signed, { operation: 'get', pathname, validUntil, access: 'private' })
  return presignedUrl
}
