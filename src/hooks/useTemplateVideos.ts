import { useQuery } from '@tanstack/react-query'
import type { PublishedTemplate } from '@/lib/templates/templateCatalog'

async function fetchTemplateVideos(): Promise<PublishedTemplate[]> {
  const res = await fetch('/api/templates/videos')
  if (!res.ok) return []
  return ((await res.json()) as { videos?: PublishedTemplate[] }).videos ?? []
}

export function useTemplateVideos() {
  return useQuery({ queryKey: ['template-videos'], queryFn: fetchTemplateVideos, staleTime: 1000 * 60 * 30 })
}
