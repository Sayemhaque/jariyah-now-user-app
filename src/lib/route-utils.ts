import { NextResponse } from 'next/server'
import type { z } from 'zod'
import { verifyJobOwnership } from '@/lib/jobStore'
import { logger } from '@/lib/logger'

type Ok<T> = { ok: true; value: T }
type Err = { ok: false; error: NextResponse }
export type Result<T> = Ok<T> | Err

export async function validateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>,
  label = 'request body',
): Promise<Result<T>> {
  try {
    const json = await req.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return {
        ok: false,
        error: NextResponse.json(
          {
            error: `Invalid ${label}`,
            details: parsed.error.issues.map((i) => ({
              path: i.path.join('.'),
              message: i.message,
            })),
          },
          { status: 400 },
        ),
      }
    }
    return { ok: true, value: parsed.data }
  } catch {
    return {
      ok: false,
      error: NextResponse.json({ error: `Invalid JSON ${label}` }, { status: 400 }),
    }
  }
}

export function validateQuery<T>(
  raw: Record<string, string | number | null | undefined>,
  schema: z.ZodSchema<T>,
): Result<T> {
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      error: NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 },
      ),
    }
  }
  return { ok: true, value: parsed.data }
}

export function requireOwnership(jobId: string, req: Request): NextResponse | null {
  const token = req.headers.get('x-owner-token')
  if (!token || !verifyJobOwnership(jobId, token)) {
    logger.warn('ownership check failed', { jobId, hasToken: !!token })
    return NextResponse.json(
      { error: 'Forbidden — invalid or missing owner token' },
      { status: 403 },
    )
  }
  return null
}
