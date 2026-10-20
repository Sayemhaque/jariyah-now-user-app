import { useRef, useState } from 'react'
import { toast } from 'sonner'

const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']

export function useVoiceRecorder(onRecorded: (file: Blob) => void) {
  const [isRecording, setIsRecording] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      const mimeType = preferredTypes.find((t) => MediaRecorder.isTypeSupported(t))
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        setIsRecording(false)
        onRecorded(new Blob(chunks, { type: recorder.mimeType.split(';')[0] }))
      }
      recorder.start()
      recorderRef.current = recorder
      setIsRecording(true)
    } catch {
      toast.error('Microphone is blocked. Allow microphone access or upload a file instead.')
    }
  }

  const stop = () => recorderRef.current?.state === 'recording' && recorderRef.current.stop()

  return { isRecording, start, stop }
}
