import { useState } from 'react'

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function useVideoDownload() {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null)

  const download = async (key: string, sourceUrl: string, fallbackUrl: string, filename: string) => {
    setDownloadingKey(key)
    try {
      const res = await fetch(sourceUrl)
      if (!res.ok) throw new Error(String(res.status))
      saveBlob(await res.blob(), filename)
    } catch {
      window.open(fallbackUrl, '_blank')
    } finally {
      setDownloadingKey(null)
    }
  }

  return { download, downloadingKey }
}
