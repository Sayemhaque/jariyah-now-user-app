import { useCallback, useRef, useState } from 'react'

const hideDelayMs = 3000

export function useAutoHideControls() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [visible, setVisible] = useState(true)

  const scheduleHide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), hideDelayMs)
  }, [])

  const reveal = useCallback(() => {
    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return { visible, reveal, scheduleHide }
}
