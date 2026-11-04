'use client'

import { MotionConfig } from 'framer-motion'

/** Every framer-motion animation follows the OS "reduce motion" setting (WCAG 2.3.3, Apple HIG). */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
