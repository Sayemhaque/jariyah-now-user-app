import { describe, it, expect } from 'vitest'
import { presentVariables } from './env'

describe('presentVariables', () => {
  it('treats empty and blank variables as unset', () => {
    expect(presentVariables({ TIKTOK_CLIENT_KEY: '', BLOB_READ_WRITE_TOKEN: '  ', INSTAGRAM_USER_ID: '123', MISSING: undefined })).toEqual({ INSTAGRAM_USER_ID: '123' })
  })
})
