import { cn } from '@/lib/utils'

interface PageSectionProps {
  id?: string
  className?: string
  innerClassName?: string
  children: React.ReactNode
}

export function PageSection({ id, className, innerClassName, children }: PageSectionProps) {
  return (
    <section id={id} className={cn('px-4 sm:px-6', className)}>
      <div className={cn('max-w-6xl mx-auto', innerClassName)}>{children}</div>
    </section>
  )
}
