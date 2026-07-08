/**
 * URL allowlist for SSRF prevention.
 *
 * The /api/render route HEAD-fetches each slide's `audioUrl` to verify the
 * reciter MP3 exists on the CDN. Without an allowlist, an attacker could
 * pass `http://169.254.169.254/...` (AWS metadata), `http://localhost:port/`,
 * or an internal IP to enumerate the server's private network.
 *
 * This module exposes a single `isAllowedAudioUrl()` function that returns
 * true only for HTTPS URLs whose host matches the configured audio CDN
 * (default: everyayah.com + verses.quran.com). The allowlist is configurable
 * via env so a fork can add their own CDN without touching code.
 */

/**
 * The set of hosts we allow the server to HEAD-fetch as reciter audio.
 * Defaults to the everyayah.com CDN (UmmahAPI-backed reciter MP3s) plus
 * the legacy verses.quran.com per-ayat CDN. Override by setting
 * `ALLOWED_AUDIO_HOSTS` in the env (comma-separated).
 */
function getAllowedAudioHosts(): string[] {
  const fromEnv =
    typeof process !== 'undefined' && process.env?.ALLOWED_AUDIO_HOSTS
      ? process.env.ALLOWED_AUDIO_HOSTS
      : ''
  if (fromEnv) {
    return fromEnv
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean)
  }
  return ['everyayah.com', 'verses.quran.com']
}

/**
 * True if `url` is an HTTPS URL on an allowed host. Rejects:
 *   - non-https URLs (http:, file:, data:, etc.)
 *   - URLs with credentials (user:pass@host)
 *   - URLs whose host isn't on the allowlist
 *   - malformed URLs (throws → caught → false)
 *
 * This is the single gatekeeper for the `audioUrl` field in the render
 * payload. The route handler also uses it to double-check before issuing
 * the HEAD request.
 */
export function isAllowedAudioUrl(url: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  // Must be HTTPS — never allow plain http, file:, data:, etc.
  if (parsed.protocol !== 'https:') return false

  // Reject embedded credentials (https://user:pass@host/).
  if (parsed.username || parsed.password) return false

  // Host must be on the allowlist (case-insensitive).
  const host = parsed.hostname.toLowerCase()
  return getAllowedAudioHosts().includes(host)
}
