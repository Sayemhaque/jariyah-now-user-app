import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchRecordings, uploadRecording } from '@/lib/recordings/recordingsApi'
import type { TextMode } from '@/lib/collections/types'
import { useUploadKey } from './useUploadKey'

export function useRecordings(mode: TextMode, itemId: string) {
  const queryClient = useQueryClient()
  const [uploadKey, setUploadKey] = useUploadKey()
  const [isUploading, setIsUploading] = useState(false)
  const query = useQuery({ queryKey: ['recordings', mode], queryFn: () => fetchRecordings(mode), staleTime: 1000 * 60 * 20 })
  const recording = query.data?.find((r) => r.itemId === itemId) ?? null

  const upload = async (file: Blob) => {
    if (!uploadKey) {
      toast.error('Enter your upload key first')
      return
    }
    setIsUploading(true)
    try {
      await uploadRecording(mode, itemId, file, uploadKey)
      await queryClient.invalidateQueries({ queryKey: ['recordings', mode] })
      toast.success('Recording saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return { recording, upload, isUploading, uploadKey, setUploadKey, recordedIds: new Set(query.data?.map((r) => r.itemId)) }
}
