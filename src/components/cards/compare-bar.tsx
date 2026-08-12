'use client'

import { useAnalysisStore } from '@/store/use-analysis-store'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, X, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { trackInteraction } from '@/lib/interactions/client'

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
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-2 right-2 z-50 md:bottom-6 md:left-1/2 md:right-auto md:-translate-x-1/2"
        >
          <div className="flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-[#d4a017]/30 bg-white/95 p-3 shadow-2xl shadow-black/10 backdrop-blur-xl ring-1 ring-black/5 md:w-auto md:flex-row md:items-center md:gap-3 md:px-4 md:py-3">
            {/* Icon */}
            <GitCompare className="hidden h-4 w-4 shrink-0 text-[#b8860b] sm:block" />

            {/* Cards */}
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible md:pb-0">
              {comparedCards.map((card) => (
                <div
                  key={card.id}
                  className="flex min-w-[9rem] shrink-0 items-center gap-1.5 rounded-xl border border-[#d4a017]/30 bg-[#fdf3d7]/40 px-2 py-1 md:min-w-0"
                >
                  {/* Bank initial badge */}
                  <div className="text-[0.55rem] font-bold text-[#b8860b]">
                    {card.bank_name.charAt(0)}
                  </div>
                  <span className="max-w-[7rem] truncate text-[0.65rem] font-medium text-foreground md:max-w-[90px]">
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
                  className="flex h-8 min-w-[6.5rem] shrink-0 items-center justify-center rounded-xl border border-dashed border-border/40 bg-muted/10 md:w-24"
                >
                  <span className="text-[0.6rem] text-muted-foreground">+ Add card</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden h-6 w-px bg-border/40 md:block" />

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2 md:justify-start md:border-t-0 md:pt-0">
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
                onClick={() => {
                  void trackInteraction('compare_started', {
                    page: '/cards',
                    entityType: 'card_compare',
                    metadata: {
                      comparedCardIds: comparedCardIds,
                      comparedCount: count,
                    },
                  })
                  router.push('/cards/compare')
                }}
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
