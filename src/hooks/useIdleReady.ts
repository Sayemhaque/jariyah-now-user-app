import { useEffect, useState } from 'react'

export function useIdleReady(timeout = 600) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (typeof window.requestIdleCallback !== 'function') {
      const id = window.setTimeout(() => setReady(true), 150)
      return () => window.clearTimeout(id)
    }
    const id = window.requestIdleCallback(() => setReady(true), { timeout })
    return () => window.cancelIdleCallback(id)
  }, [timeout])
  return ready
}
