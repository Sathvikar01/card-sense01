'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAnalysisStore } from '@/store/use-analysis-store'
import { Button } from '@/components/ui/button'
import { trackInteraction } from '@/lib/interactions/client'

export function CompareBar() {
  const { comparedCardIds, clearComparison } = useAnalysisStore()
  const router = useRouter()
  const count = comparedCardIds.length

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:bottom-6"
        >
          <div className="flex items-center gap-1 rounded-full bg-pine py-1.5 pl-5 pr-1.5 text-paper shadow-xl">
            <span className="mr-2 text-sm tabular-nums">{count} of 3</span>
            <Button variant="ghost" size="sm" className="text-paper/70 hover:bg-paper/10 hover:text-paper" onClick={clearComparison}>
              Clear
            </Button>
            <Button
              size="sm"
              className="bg-gold text-pine hover:bg-gold/90"
              disabled={count < 2}
              onClick={() => {
                void trackInteraction('compare_started', {
                  page: '/cards',
                  entityType: 'card_compare',
                  metadata: { comparedCardIds, comparedCount: count },
                })
                router.push('/cards/compare')
              }}
            >
              Compare
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
