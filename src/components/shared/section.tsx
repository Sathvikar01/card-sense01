import Link from 'next/link'

/**
 * A heading and its content, straight on the paper. No panel, no border:
 * space alone separates one section from the next.
 * `action` is an optional text link on the right of the heading.
 */
export function Section({
  title,
  action,
  className,
  children,
}: {
  title: string
  action?: { label: string; href: string }
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={className}>
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {action && (
          <Link href={action.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

/** One quiet line for an empty section. */
export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-4 py-3 text-sm text-muted-foreground">{children}</div>
}
