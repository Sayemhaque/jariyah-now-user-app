import { env } from './env'
import { logger } from './logger'

const isConfigured = Boolean(env.SENTRY_DSN)

export async function captureException(err: unknown, context?: Record<string, unknown>): Promise<void> {
  if (!isConfigured) {
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
    logger.error('Sentry import failed — falling back to logger', {
      originalError: err instanceof Error ? err.message : String(err),
      importError: importErr instanceof Error ? importErr.message : String(importErr),
    })
  }
}
