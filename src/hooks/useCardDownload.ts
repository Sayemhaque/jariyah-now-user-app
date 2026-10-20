import { useState } from 'react'
import { toast } from 'sonner'
import { toPng } from 'html-to-image'

function saveDataUrl(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function useCardDownload() {
  const [isSaving, setIsSaving] = useState(false)

  const save = async (nodes: (HTMLElement | null)[], baseName: string) => {
    setIsSaving(true)
    try {
      for (const [index, node] of nodes.entries()) {
        if (!node) continue
        const url = await toPng(node, { pixelRatio: 1, cacheBust: true, width: node.offsetWidth, height: node.offsetHeight })
        saveDataUrl(url, nodes.length > 1 ? `${baseName}-${index + 1}.png` : `${baseName}.png`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the image')
    } finally {
      setIsSaving(false)
    }
  }

  return { save, isSaving }
}
