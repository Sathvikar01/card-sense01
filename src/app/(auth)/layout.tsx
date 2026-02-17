import { CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/60 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <CreditCard className="h-10 w-10 text-primary" />
          <span className="text-3xl font-bold text-gray-900">CardSense</span>
        </Link>

        {/* Auth Card */}
        <div className="cardsense-card rounded-2xl p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Your data is secure and never shared with third parties.
        </p>
      </div>
    </div>
  )
}
