import Link from 'next/link'
import { cn } from '@/lib/utils'

/** A nav label. The active one is set in pine at semibold; the rest stay muted. */
export function NavLink({ href, active, className, children }: { href: string; active: boolean; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center justify-center transition-colors',
        active ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {children}
    </Link>
  )
}
