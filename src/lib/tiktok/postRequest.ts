import { z } from 'zod'

export const postRequestSchema = z.object({
  jobId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/),
  form: z.object({
    title: z.string().max(2200),
    privacyLevel: z.string().min(1),
    allowComment: z.boolean(),
    allowDuet: z.boolean(),
    allowStitch: z.boolean(),
    commercial: z.boolean(),
    yourBrand: z.boolean(),
    brandedContent: z.boolean(),
  }),
})

export type PostRequest = z.infer<typeof postRequestSchema>
