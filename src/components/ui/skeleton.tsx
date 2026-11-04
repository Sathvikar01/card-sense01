import { cn } from '@/lib/utils'

/** Placeholder in the shape of what is loading. Pulses only when motion is allowed. */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="skeleton" aria-hidden="true" className={cn('shimmer', className)} {...props} />
}

export { Skeleton }
