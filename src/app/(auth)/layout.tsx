import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div>{children}</div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <span className="mx-2">·</span>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
        </p>
      </div>
    </div>
  )
}
