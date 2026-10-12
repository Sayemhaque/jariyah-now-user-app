import { useEffect } from 'react'
import { useBuilderStore } from '@/lib/store'
import { useSurahsQuery } from '@/lib/queries/builder'
import type { useAyatRange } from './useAyatRange'

export const emptyAyatMessage = 'Could not load ayat data. Check your connection and try again.'

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Failed to load ayat data'

export function useBuilderDataSync(query: ReturnType<typeof useAyatRange>['query']) {
  const setSurahs = useBuilderStore((s) => s.setSurahs)
  const setAyatList = useBuilderStore((s) => s.setAyatList)
  const setAyatLoading = useBuilderStore((s) => s.setAyatLoading)
  const setAyatError = useBuilderStore((s) => s.setAyatError)
  const surahsQuery = useSurahsQuery()

  useEffect(() => {
    if (surahsQuery.data?.length) setSurahs(surahsQuery.data)
  }, [surahsQuery.data, setSurahs])

  useEffect(() => {
    setAyatLoading(query.isFetching)
  }, [query.isFetching, setAyatLoading])

  useEffect(() => {
    if (!query.isSuccess) return
    if (!query.data.length) {
      setAyatList([])
      setAyatError(emptyAyatMessage)
      return
    }
    setAyatError(null)
    setAyatList(query.data)
  }, [query.data, query.isSuccess, setAyatError, setAyatList])

  useEffect(() => {
    if (!query.error) return
    setAyatList([])
    setAyatError(errorMessage(query.error))
  }, [query.error, setAyatError, setAyatList])
}
