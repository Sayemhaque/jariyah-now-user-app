import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

export interface TikTokSession {
  accessToken: string
  openId: string
  expiresAt: number
}

export const sessionCookie = 'tiktok_session'
export const stateCookie = 'tiktok_state'

const keyFrom = (secret: string) => createHash('sha256').update(`tiktok-session:${secret}`).digest()

export function sealSession(session: TikTokSession, secret: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyFrom(secret), iv)
  const body = Buffer.concat([cipher.update(JSON.stringify(session), 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url')
}

export function openSession(sealed: string | undefined, secret: string, now = Date.now()): TikTokSession | null {
  if (!sealed) return null
  try {
    const raw = Buffer.from(sealed, 'base64url')
    const decipher = createDecipheriv('aes-256-gcm', keyFrom(secret), raw.subarray(0, 12))
    decipher.setAuthTag(raw.subarray(12, 28))
    const session = JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8')) as TikTokSession
    return session.expiresAt > now ? session : null
  } catch {
    return null
  }
}
