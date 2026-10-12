import { useEffect, useState } from 'react'

const seenKey = 'qv-drawer-seen'

export function useSettingsDrawer() {
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && !localStorage.getItem(seenKey))
  useEffect(() => {
    if (open) localStorage.setItem(seenKey, '1')
  }, [open])
  return [open, setOpen] as const
}
