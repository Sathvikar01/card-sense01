'use client'

import { useAnalysisStore } from '@/store/use-analysis-store'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, X, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CompareBar() {
  const { comparedCards, comparedCardIds, toggleCompareCard, clearComparison } =
    useAnalysisStore()
  const router = useRouter()
  const count = comparedCardIds.length

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 md:bottom-6"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-[#d4a017]/30 bg-white/95 px-4 py-3 shadow-2xl shadow-black/10 backdrop-blur-xl ring-1 ring-black/5">
            {/* Icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#b8860b] to-[#d4a017]">
              <GitCompare className="h-4 w-4 text-white" />
            </div>

            {/* Cards */}
            <div className="flex items-center gap-2">
              {comparedCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center gap-1.5 rounded-xl border border-[#d4a017]/30 bg-[#fdf3d7]/40 px-2 py-1"
                >
                  {/* Bank initial badge */}
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#b8860b] to-[#d4a017] text-[0.55rem] font-bold text-white">
                    {card.bank_name.charAt(0)}
                  </div>
                  <span className="max-w-[90px] truncate text-[0.65rem] font-medium text-foreground">
                    {card.card_name}
                  </span>
                  <button
                    onClick={() => toggleCompareCard(card.id, card)}
                    className="ml-0.5 rounded-full p-0.5 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                    aria-label={`Remove ${card.card_name}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 3 - count }).map((_, i) => (
                <div
                  key={`slot-${i}`}
                  className="flex h-8 w-24 items-center justify-center rounded-xl border border-dashed border-border/40 bg-muted/10"
                >
                  <span className="text-[0.6rem] text-muted-foreground">+ Add card</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border/40" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearComparison}
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
              <Button
                size="sm"
                disabled={count < 2}
                onClick={() => router.push('/cards/compare')}
                className="cardsense-btn-primary h-7 gap-1.5 text-xs"
              >
                Compare {count}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {count < 2 && (
            <p className="mt-1.5 text-center text-[0.6rem] text-muted-foreground">
              Select at least 2 cards to compare
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
