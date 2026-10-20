import { useEffect, useRef, useState } from 'react'

export function useFitScale(contentWidth: number, contentHeight: number) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(0.3)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const update = () => setScale(Math.min(node.clientWidth / contentWidth, node.clientHeight / contentHeight))
    const observer = new ResizeObserver(update)
    observer.observe(node)
    update()
    return () => observer.disconnect()
  }, [contentWidth, contentHeight])
  return { ref, scale }
}
