import { cn } from '@/lib/utils'

/*
 * The app's only two drawn marks, authored here in one 1.5px stroke.
 * Everything else is said in words.
 */

export function Chevron({ className, direction = 'down' }: { className?: string; direction?: 'down' | 'up' | 'right' }) {
  const rotate = { down: '', up: 'rotate-180', right: '-rotate-90' }[direction]
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className={cn('size-3 shrink-0', rotate, className)}>
      <path d="M3 4.75 6 7.75l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Tick({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className={cn('size-3 shrink-0', className)}>
      <path d="m2.75 6.25 2.25 2.25 4.25-4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
