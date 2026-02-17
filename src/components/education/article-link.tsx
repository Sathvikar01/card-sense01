'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

interface ArticleLinkProps {
  href: string
  className?: string
  children: ReactNode
}

export function ArticleLink({ href, className, children }: ArticleLinkProps) {
  const router = useRouter()

  const prefetch = () => {
    router.prefetch(href)
  }

  return (
    <Link href={href} className={className} onMouseEnter={prefetch} onFocus={prefetch}>
      {children}
    </Link>
  )
}
