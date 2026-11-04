import { cn } from '@/lib/utils'

/** A pine card with its gold chip. The chip is the app's one signature mark. */
export function LogoMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn('shrink-0', className)}>
      <rect x="1" y="4" width="22" height="16" rx="4" fill="var(--pine)" />
      <rect x="4.5" y="9" width="5" height="4" rx="1.25" fill="var(--gold)" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground', className)}>
      <LogoMark />
      CardSense
    </span>
  )
}
