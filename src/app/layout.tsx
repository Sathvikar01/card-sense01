import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'CardSense India - AI-Powered Credit Card Advisor',
  description:
    'Find the perfect credit card with AI-powered recommendations. Compare 50+ Indian credit cards, track spending, and maximize rewards.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="cardsense-theme antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
