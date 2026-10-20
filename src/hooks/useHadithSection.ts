import { useQuery } from '@tanstack/react-query'
import { fetchHadithSection } from '@/lib/hadith/hadithApi'
import type { HadithLanguage } from '@/lib/hadith/types'

export function useHadithSection(book: string, section: number, language: HadithLanguage) {
  return useQuery({
    queryKey: ['hadith-section', book, section, language],
    queryFn: () => fetchHadithSection(book, language, section),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  })
}
