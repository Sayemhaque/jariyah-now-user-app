import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  size: number
  className?: string
  alt?: string
  priority?: boolean
}

export function BrandLogo({ size, className, alt = 'Jariyah Now logo', priority }: BrandLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn('object-contain', className)}
    />
  )
}
