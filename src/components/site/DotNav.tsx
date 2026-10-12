import { Fragment } from 'react'
import Link from 'next/link'
import type { NavItem } from '@/lib/content/site'

interface DotNavProps {
  links: NavItem[]
  linkClassName: string
}

export function DotNav({ links, linkClassName }: DotNavProps) {
  return (
    <nav className="flex items-center gap-3">
      {links.map((link, index) => (
        <Fragment key={link.href}>
          {index > 0 && <span className="opacity-40">·</span>}
          <Link href={link.href} className={linkClassName}>
            {link.label}
          </Link>
        </Fragment>
      ))}
    </nav>
  )
}
