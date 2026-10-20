import { Loader2, Mic, Square, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/selection/FieldLabel'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import type { StoredRecording } from '@/lib/recordings/blobRecordings'
import { UploadKeyField } from './UploadKeyField'

interface VoicePanelProps {
  recording: StoredRecording | null
  isUploading: boolean
  uploadKey: string
  setUploadKey: (key: string) => void
  upload: (file: Blob) => void
}

export function VoicePanel({ recording, isUploading, uploadKey, setUploadKey, upload }: VoicePanelProps) {
  const recorder = useVoiceRecorder(upload)
  const busy = isUploading || recorder.isRecording
  return (
    <div className="space-y-2">
      <FieldLabel icon={Mic}>Your voice</FieldLabel>
      {recording && <audio src={recording.url} controls preload="none" className="h-9 w-full" />}
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant={recorder.isRecording ? 'destructive' : 'secondary'} onClick={recorder.isRecording ? recorder.stop : recorder.start} disabled={isUploading}>
          {recorder.isRecording ? <Square className="mr-1.5 h-4 w-4" /> : <Mic className="mr-1.5 h-4 w-4" />}
          {recorder.isRecording ? 'Stop' : recording ? 'Re-record' : 'Record'}
        </Button>
        <Button type="button" variant="secondary" asChild disabled={busy}>
          <label className="cursor-pointer">
            {isUploading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
            Upload file
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        </Button>
      </div>
      <UploadKeyField value={uploadKey} onChange={setUploadKey} />
    </div>
  )
}
