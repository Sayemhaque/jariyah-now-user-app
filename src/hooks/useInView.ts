import { useEffect, useState, type RefObject } from 'react'

export function useInView(ref: RefObject<Element | null>, enabled = true, rootMargin = '400px') {
  const [seen, setSeen] = useState(!enabled)
  useEffect(() => {
    const node = ref.current
    if (seen || !node) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setSeen(true)
    }, { rootMargin })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, seen, rootMargin])
  return seen
}
