import Link from 'next/link'
import { Button } from '@/components/ui/button'

/** What belongs here, and the one action that fills it. The only empty-state component. */
/** `primary` only for the page's one main action; everything else stays a tinted secondary button. */
export function EmptyState({
  title,
  actionLabel,
  actionHref,
  primary = false,
}: {
  title: string
  actionLabel?: string
  actionHref?: string
  primary?: boolean
}) {
  return (
    <div className="flex flex-col items-start gap-3 py-4">
      <p className="text-muted-foreground">{title}</p>
      {actionLabel && actionHref && (
        <Button asChild size="sm" variant={primary ? 'default' : 'outline'}>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
