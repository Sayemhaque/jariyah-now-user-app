import { toast } from 'sonner'
import { useBuilderStore } from '@/lib/store'
import { useAyatRange } from './useAyatRange'
import { emptyAyatMessage, errorMessage, useBuilderDataSync } from './useBuilderDataSync'

export function useAyatLoader() {
  const ayatCount = useBuilderStore((s) => s.ayatList.length)
  const setAyatList = useBuilderStore((s) => s.setAyatList)
  const setAyatError = useBuilderStore((s) => s.setAyatError)
  const { selectedSurah, validation, query } = useAyatRange()
  useBuilderDataSync(query)

  const loadAyats = async () => {
    if (!selectedSurah) {
      toast.error('Please pick a surah first')
      return
    }
    if (!validation.ok) {
      toast.error(validation.error ?? 'Invalid ayat range')
      return
    }
    setAyatError(null)
    setAyatList([])
    const result = await query.refetch()
    if (result.error) {
      toast.error(errorMessage(result.error))
      return
    }
    if (!result.data?.length) {
      toast.error(emptyAyatMessage)
      return
    }
    toast.success('Ayat data loaded — press play in the preview.')
  }

  return {
    loadAyats,
    isFetching: query.isFetching,
    hasAyats: ayatCount > 0,
    canLoad: Boolean(selectedSurah) && validation.ok,
    canExport: ayatCount > 0 && validation.ok,
  }
}
