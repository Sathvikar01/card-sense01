import Link from 'next/link'

/**
 * A titled white panel on paper: the one layout block every app page is built from.
 * `action` is an optional text link on the right of the title.
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
      <div className="mb-2.5 flex items-baseline justify-between px-1">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {action && (
          <Link href={action.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {action.label}
          </Link>
        )}
      </div>
      <div className="surface p-1.5">{children}</div>
    </section>
  )
}

/** Centred quiet line for an empty panel. */
export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center gap-4 px-5 py-10 text-center text-sm text-muted-foreground">{children}</div>
}
