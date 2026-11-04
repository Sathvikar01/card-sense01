'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ResearchedQuestion } from './researched-questions'

interface FollowUpQuestionStepProps {
  questions: ResearchedQuestion[]
  answers: Record<string, string>
  monthlySpend: string
  onAnswer: (questionId: string, value: string) => void
  onMonthlySpendChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
}

const ADVANCE_DELAY_MS = 180

/** One question per screen. Picking an option moves on; the last screen asks for monthly spend. */
export function FollowUpQuestionStep({
  questions,
  answers,
  monthlySpend,
  onAnswer,
  onMonthlySpendChange,
  onSubmit,
  isSubmitting,
}: FollowUpQuestionStepProps) {
  const firstUnanswered = questions.findIndex((q) => !answers[q.id])
  const [index, setIndex] = useState(firstUnanswered === -1 ? questions.length : firstUnanswered)
  const spendRef = useRef<HTMLInputElement>(null)

  const total = questions.length + 1
  const isSpendStep = index === questions.length
  const question = questions[index]
  const canSubmit = questions.every((q) => answers[q.id]) && Number(monthlySpend) > 0

  useEffect(() => {
    if (isSpendStep) spendRef.current?.focus()
  }, [isSpendStep])

  const choose = (value: string) => {
    onAnswer(question.id, value)
    window.setTimeout(() => setIndex((i) => Math.min(i + 1, questions.length)), ADVANCE_DELAY_MS)
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-10 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          aria-label="Previous question"
          className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
          aria-label={`Question ${index + 1} of ${total}`}
          className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-[var(--ease-out)]"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
        >
          {isSpendStep ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (canSubmit && !isSubmitting) onSubmit()
              }}
            >
              <label htmlFor="advisor-monthly-spend" className="block text-2xl font-semibold tracking-tight">
                Monthly card spend
              </label>
              <div className="relative mt-6">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">₹</span>
                <input
                  ref={spendRef}
                  id="advisor-monthly-spend"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  value={monthlySpend}
                  onChange={(e) => onMonthlySpendChange(e.target.value)}
                  placeholder="30,000"
                  className="h-14 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-lg tabular-nums outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 focus:border-ring focus:ring-[3px] focus:ring-ring/15"
                />
              </div>
              <Button type="submit" size="lg" className="mt-6 w-full" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Finding matches…' : 'See matches'}
              </Button>
            </form>
          ) : (
            <fieldset>
              <legend className="text-2xl font-semibold tracking-tight">{question.question}</legend>
              <div className="mt-6 space-y-2">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => choose(option.value)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-[15px] transition-[border-color,background-color,transform] duration-150 active:scale-[0.99]',
                        selected ? 'border-primary bg-accent' : 'border-border bg-card hover:border-foreground/20'
                      )}
                    >
                      {option.label}
                      {selected && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
