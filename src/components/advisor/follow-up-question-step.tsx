'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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

/** One question per screen. Picking an answer moves on; the last screen asks for monthly spend. */
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
  const [spendError, setSpendError] = useState('')
  const spendRef = useRef<HTMLInputElement>(null)

  const total = questions.length + 1
  const isSpendStep = index === questions.length
  const question = questions[index]

  useEffect(() => {
    if (isSpendStep) spendRef.current?.focus()
  }, [isSpendStep])

  const choose = (value: string) => {
    if (!value) return
    onAnswer(question.id, value)
    window.setTimeout(() => setIndex((i) => Math.min(i + 1, questions.length)), ADVANCE_DELAY_MS)
  }

  // Validate on submit, never by disabling the button (WCAG 3.3.1).
  const submit = () => {
    const missing = questions.findIndex((q) => !answers[q.id])
    if (missing !== -1) {
      setIndex(missing)
      return
    }
    if (!(Number(monthlySpend) > 0)) {
      setSpendError('Enter what you spend on cards in a typical month, for example 30000.')
      spendRef.current?.focus()
      return
    }
    setSpendError('')
    onSubmit()
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className="tap text-sm text-muted-foreground transition-colors hover:text-foreground disabled:invisible"
        >
          Back
        </button>
        <p className="ml-auto text-sm text-muted-foreground" aria-live="polite">
          {index + 1} of {total}
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
        >
          {isSpendStep ? (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                if (!isSubmitting) submit()
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
                  name="monthly-spend"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  value={monthlySpend}
                  onChange={(e) => {
                    onMonthlySpendChange(e.target.value)
                    if (spendError) setSpendError('')
                  }}
                  placeholder="30000"
                  aria-invalid={Boolean(spendError)}
                  aria-describedby={spendError ? 'advisor-spend-error' : undefined}
                  className="h-14 w-full rounded-2xl bg-card pl-9 pr-4 text-lg tabular-nums placeholder:text-muted-foreground aria-invalid:outline-2 aria-invalid:outline-ring"
                />
              </div>
              {spendError && (
                <p id="advisor-spend-error" role="alert" className="mt-3 text-sm">
                  {spendError}
                </p>
              )}
              <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Finding matches…' : 'See matches'}
              </Button>
            </form>
          ) : (
            <div role="group" aria-labelledby="advisor-question">
              <h2 id="advisor-question" className="text-2xl font-semibold tracking-tight">
                {question.question}
              </h2>
              <ToggleGroup
                type="single"
                variant="option"
                aria-labelledby="advisor-question"
                value={answers[question.id] ?? ''}
                onValueChange={choose}
                className="mt-6"
              >
                {question.options.map((option) => (
                  <ToggleGroupItem key={option.value} value={option.value}>
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
