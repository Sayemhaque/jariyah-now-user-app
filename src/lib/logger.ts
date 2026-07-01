/**
 * Tiny structured logger. In production this would be `pino` or similar
 * piping to a log aggregator; here we keep it dependency-free but with the
 * same JSON shape so it can be swapped out later without touching call sites.
 *
 * Every log line includes a timestamp, level, message, and any structured
 * context fields. Request IDs should be passed in from the route handler so
 * logs across a single request can be correlated.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

function emit(level: LogLevel, message: string, context: LogContext = {}): void {
  const line = {
    t: new Date().toISOString(),
    level,
    message,
    ...context,
  }
  const fn =
    level === 'error'
      ? console.error
      : level === 'warn'
        ? console.warn
        : level === 'debug'
          ? console.debug
          : console.info
  fn(JSON.stringify(line))
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit('debug', message, context),
  info: (message: string, context?: LogContext) => emit('info', message, context),
  warn: (message: string, context?: LogContext) => emit('warn', message, context),
  error: (message: string, context?: LogContext) => emit('error', message, context),
}
