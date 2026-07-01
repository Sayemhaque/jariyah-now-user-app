/**
 * Thin wrapper around @sentry/nextjs that gracefully no-ops when SENTRY_DSN
 * isn't configured. This lets call sites (error.tsx, API routes) always
 * call `captureException(err)` without checking env first.
 *
 * In production with SENTRY_DSN set, errors flow to Sentry. In dev, they
 * fall through to console.error so they still show up in the terminal.
 */

import { env } from './env'
import { logger } from './logger'

const isConfigured = Boolean(env.SENTRY_DSN)

/**
 * Lazily-imported Sentry captureException. We dynamically import so the
 * bundle doesn't pull in the full Sentry SDK when SENTRY_DSN is unset
 * (dev environments without Sentry).
 */
export async function captureException(err: unknown, context?: Record<string, unknown>): Promise<void> {
  if (!isConfigured) {
    // Dev fallback — log to the structured logger so it shows up in the
    // terminal without requiring a Sentry setup.
    logger.error('uncaught exception', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      ...context,
    })
    return
  }

  try {
    const Sentry = await import('@sentry/nextjs')
    if (context) {
      Sentry.withScope((scope) => {
        for (const [key, value] of Object.entries(context)) {
          scope.setContext(key, { value })
        }
        Sentry.captureException(err)
      })
    } else {
      Sentry.captureException(err)
    }
  } catch (importErr) {
    // If the Sentry import itself fails, fall back to the logger so we
    // never silently swallow an error.
    logger.error('Sentry import failed — falling back to logger', {
      originalError: err instanceof Error ? err.message : String(err),
      importError: importErr instanceof Error ? importErr.message : String(importErr),
    })
  }
}
