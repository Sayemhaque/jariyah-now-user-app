import { describe, it, expect } from 'vitest'
import { openSession, sealSession } from './session'

const session = { accessToken: 'act.123', openId: 'open-1', expiresAt: 2_000 }

describe('tiktok session cookie', () => {
  it('round-trips a sealed session', () => {
    expect(openSession(sealSession(session, 'secret'), 'secret', 1_000)).toEqual(session)
  })

  it('rejects a wrong secret, tampering and expiry', () => {
    const sealed = sealSession(session, 'secret')
    expect(openSession(sealed, 'other', 1_000)).toBeNull()
    expect(openSession(`${sealed.slice(0, -2)}xx`, 'secret', 1_000)).toBeNull()
    expect(openSession(sealed, 'secret', 3_000)).toBeNull()
    expect(openSession(undefined, 'secret')).toBeNull()
  })
})
