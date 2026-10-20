export interface CreatorInfo {
  avatarUrl: string
  nickname: string
  username: string
  privacyOptions: string[]
  commentDisabled: boolean
  duetDisabled: boolean
  stitchDisabled: boolean
  maxDurationSec: number
}

export interface TikTokPostForm {
  title: string
  privacyLevel: string | null
  allowComment: boolean
  allowDuet: boolean
  allowStitch: boolean
  commercial: boolean
  yourBrand: boolean
  brandedContent: boolean
}

export const emptyPostForm: Omit<TikTokPostForm, 'title'> = {
  privacyLevel: null,
  allowComment: false,
  allowDuet: false,
  allowStitch: false,
  commercial: false,
  yourBrand: false,
  brandedContent: false,
}

export const privacyLabels: Record<string, string> = {
  PUBLIC_TO_EVERYONE: 'Everyone',
  MUTUAL_FOLLOW_FRIENDS: 'Friends',
  FOLLOWER_OF_CREATOR: 'Followers',
  SELF_ONLY: 'Only me',
}

export const maxTitleLength = 2200
export const musicUsageUrl = 'https://www.tiktok.com/legal/page/global/music-usage-confirmation/en'
export const brandedContentUrl = 'https://www.tiktok.com/legal/page/global/bc-policy/en'

export const isPrivacyAllowed = (form: TikTokPostForm, level: string) => !(level === 'SELF_ONLY' && form.commercial && form.brandedContent)

export function postBlockers(form: TikTokPostForm, creator: CreatorInfo, durationSec: number): string[] {
  const blockers: string[] = []
  if (durationSec > creator.maxDurationSec) blockers.push(`This video is longer than the ${creator.maxDurationSec}s your account can post.`)
  if (!form.privacyLevel) blockers.push('ভিডিওটি কারা দেখতে পারবে তা বেছে নিন।')
  if (form.privacyLevel && !isPrivacyAllowed(form, form.privacyLevel)) blockers.push('ব্র্যান্ডেড কনটেন্ট “শুধু আমি” রাখা যায় না।')
  if (form.commercial && !form.yourBrand && !form.brandedContent) blockers.push('আপনি নিজের, অন্য কারও, নাকি দুটোরই প্রচার করছেন তা বেছে নিন।')
  if (form.title.length > maxTitleLength) blockers.push(`ক্যাপশন ${maxTitleLength} অক্ষরের মধ্যে রাখুন।`)
  return blockers
}

export function commercialLabel(form: TikTokPostForm): string | null {
  if (!form.commercial) return null
  if (form.brandedContent) return "আপনার ভিডিওতে 'Paid partnership' লেবেল দেখানো হবে।"
  if (form.yourBrand) return "আপনার ভিডিওতে 'Promotional content' লেবেল দেখানো হবে।"
  return null
}

export const needsBrandedContentPolicy = (form: TikTokPostForm) => form.commercial && form.brandedContent

export function toPostInfo(form: TikTokPostForm) {
  return {
    title: form.title,
    privacy_level: form.privacyLevel,
    disable_comment: !form.allowComment,
    disable_duet: !form.allowDuet,
    disable_stitch: !form.allowStitch,
    brand_content_toggle: form.commercial && form.brandedContent,
    brand_organic_toggle: form.commercial && form.yourBrand,
  }
}
