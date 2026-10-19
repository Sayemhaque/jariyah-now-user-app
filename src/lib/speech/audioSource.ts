const audioHosts = ['everyayah.com', 'download.quranicaudio.com', 'verses.quran.com', 'audio.qurancdn.com', 'mirrors.quranicaudio.com', 'cdn.islamic.network', 'ummahapi.com']

export const maxAudioBytes = 15 * 1024 * 1024

export function isAllowedAudioUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && audioHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
  } catch {
    return false
  }
}

export const proxiedAudioUrl = (url: string) => `/api/audio?url=${encodeURIComponent(url)}`
