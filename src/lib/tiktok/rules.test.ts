import { describe, it, expect } from 'vitest'
import { commercialLabel, emptyPostForm, isPrivacyAllowed, postBlockers, toPostInfo, type CreatorInfo } from './rules'

const creator: CreatorInfo = {
  avatarUrl: '',
  nickname: 'Jariyah Now',
  username: 'jariyahnow',
  privacyOptions: ['PUBLIC_TO_EVERYONE', 'SELF_ONLY'],
  commentDisabled: false,
  duetDisabled: false,
  stitchDisabled: false,
  maxDurationSec: 600,
}
const form = { ...emptyPostForm, title: 'Surah Al-Ikhlas' }

describe('postBlockers', () => {
  it('requires the user to choose a privacy level', () => {
    expect(postBlockers(form, creator, 30)).toContain('Choose who can view this video.')
    expect(postBlockers({ ...form, privacyLevel: 'PUBLIC_TO_EVERYONE' }, creator, 30)).toEqual([])
  })

  it('blocks videos longer than the creator may post', () => {
    expect(postBlockers({ ...form, privacyLevel: 'SELF_ONLY' }, creator, 700)[0]).toMatch(/longer than the 600s/)
  })

  it('requires a commercial choice once disclosure is on', () => {
    const blockers = postBlockers({ ...form, privacyLevel: 'PUBLIC_TO_EVERYONE', commercial: true }, creator, 30)
    expect(blockers).toHaveLength(1)
  })

  it('does not allow private branded content', () => {
    const branded = { ...form, commercial: true, brandedContent: true, privacyLevel: 'SELF_ONLY' }
    expect(isPrivacyAllowed(branded, 'SELF_ONLY')).toBe(false)
    expect(postBlockers(branded, creator, 30)).toContain('Branded content visibility cannot be set to private.')
  })
})

describe('commercialLabel', () => {
  it('labels branded content as a paid partnership and own brand as promotional', () => {
    expect(commercialLabel({ ...form, commercial: true, yourBrand: true })).toMatch(/Promotional content/)
    expect(commercialLabel({ ...form, commercial: true, yourBrand: true, brandedContent: true })).toMatch(/Paid partnership/)
    expect(commercialLabel(form)).toBeNull()
  })
})

describe('toPostInfo', () => {
  it('turns interactions off unless the user turned them on', () => {
    const info = toPostInfo({ ...form, privacyLevel: 'SELF_ONLY', allowComment: true })
    expect(info).toMatchObject({ disable_comment: false, disable_duet: true, disable_stitch: true, brand_content_toggle: false, brand_organic_toggle: false })
  })
})
