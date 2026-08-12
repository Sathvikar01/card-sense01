'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { MotionConfig } from 'framer-motion'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  )
}
