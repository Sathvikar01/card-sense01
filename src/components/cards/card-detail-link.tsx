'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import type { ReactNode } from 'react'

interface CardDetailLinkProps {
  cardId: string
  className?: string
  children: ReactNode
}

export function CardDetailLink({ cardId, className, children }: CardDetailLinkProps) {
  const router = useRouter()
  const href = useMemo(() => `/cards/${cardId}`, [cardId])

  const prefetch = () => {
    router.prefetch(href)
  }

  return (
    <Link href={href} className={className} onMouseEnter={prefetch} onFocus={prefetch}>
      {children}
    </Link>
  )
}
