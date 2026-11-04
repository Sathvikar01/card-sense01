import Link from 'next/link'
import { cn } from '@/lib/utils'

/** A nav label. The active one is set in pine with the gold chip beneath it. */
export function NavLink({ href, active, className, children }: { href: string; active: boolean; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex flex-col items-center justify-center transition-colors',
        active ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          'absolute bottom-1.5 h-[3px] w-3.5 rounded-full bg-gold transition-[opacity,transform] duration-200 ease-[var(--ease-out)]',
          active ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        )}
      />
    </Link>
  )
}
