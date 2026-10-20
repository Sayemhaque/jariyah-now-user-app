import { useEffect, useState } from 'react'

const storageKey = 'jariyah-upload-key'

function readKey(): string {
  try {
    return window.localStorage.getItem(storageKey) ?? ''
  } catch {
    return ''
  }
}

export function useUploadKey(): [string, (key: string) => void] {
  const [key, setKey] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setKey(readKey()), 0)
    return () => clearTimeout(timer)
  }, [])
  const update = (next: string) => {
    setKey(next)
    try {
      window.localStorage.setItem(storageKey, next)
    } catch {}
  }
  return [key, update]
}
