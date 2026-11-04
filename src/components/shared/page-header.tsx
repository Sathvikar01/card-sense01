import { cn } from '@/lib/utils'

/**
 * Title row for every app page. Deliberately has no description slot:
 * if a page needs a subtitle to make sense, the layout needs fixing instead.
 */
export function PageHeader({
  title,
  children,
  className,
}: {
  title: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-8 flex min-h-9 flex-wrap items-center justify-between gap-3', className)}>
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{title}</h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
