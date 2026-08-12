'use client'

import { cn } from '@/lib/utils'
import type { ResearchedQuestion } from './researched-questions'

export type FollowUpQuestion = ResearchedQuestion

interface FollowUpQuestionStepProps {
  questions: FollowUpQuestion[]
  answers: Record<string, string>
  monthlySpend: string
  onAnswer: (questionId: string, value: string) => void
  onMonthlySpendChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function FollowUpQuestionStep({
  questions,
  answers,
  monthlySpend,
  onAnswer,
  onMonthlySpendChange,
  onSubmit,
  isSubmitting,
}: FollowUpQuestionStepProps) {
  const answeredCount = questions.filter((question) => Boolean(answers[question.id])).length
  const allAnswered = questions.length > 0 && answeredCount === questions.length && Number(monthlySpend) > 0

  return (
    <div>
      <div className="border-b border-border/60 pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b8860b]">
          One last fit check
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
          <div>
          <h2 className="text-xl font-semibold text-foreground">Card match questions</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              These answers decide eligibility, fee comfort, spending fit, and the kind of value we prioritize.
            </p>
          </div>
          <span className="text-xs font-medium tabular-nums text-[#b8860b]">
            {answeredCount} of {questions.length} answered
          </span>
        </div>
      </div>

      <div className="space-y-8 py-6">
        {questions.map((question, index) => (
          <section key={question.id} className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fdf3d7] text-xs font-semibold text-[#b8860b]">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{question.question}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{question.why}</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const selected = answers[question.id] === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onAnswer(question.id, option.value)}
                    className={cn(
                      'relative rounded-xl border p-3.5 text-left transition-[color,background-color,border-color,opacity,box-shadow,transform] duration-200',
                      selected
                        ? 'border-[#d4a017] bg-[#fdf3d7]/70 shadow-[0_0_0_1px_#d4a017]'
                        : 'border-border bg-white hover:border-[#d4a017]/45 hover:bg-[#fdf3d7]/20'
                    )}
                  >
                    <p className="pr-5 text-sm font-medium text-foreground">{option.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{option.description}</p>
                    {selected && (
                      <span className="absolute right-3 top-3 text-[#b8860b]" aria-label="Selected">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="space-y-2 pt-1">
        <label htmlFor="advisor-monthly-spend" className="text-sm font-semibold text-foreground">
          About how much do you spend on your card each month?
        </label>
        <p className="text-xs text-muted-foreground">This keeps the dashboard and recommendation value estimate aligned with your actual monthly spend.</p>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">INR</span>
          <input
            id="advisor-monthly-spend"
            type="number"
            min={0}
            step={500}
            value={monthlySpend}
            onChange={(event) => onMonthlySpendChange(event.target.value)}
            placeholder="e.g. 30000"
            className="h-10 w-full rounded-lg border border-border bg-background pl-12 pr-3 text-sm text-foreground outline-none focus:border-[#d4a017] focus:ring-1 focus:ring-[#d4a017]/30"
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-border/60 pt-5">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!allAnswered || isSubmitting}
          className={cn(
            'rounded-xl px-6 py-2.5 text-sm font-semibold transition-[color,background-color,border-color,opacity,box-shadow,transform] duration-200',
            allAnswered && !isSubmitting
              ? 'bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white shadow-md shadow-[#b8860b]/25 hover:shadow-[#b8860b]/40'
              : 'cursor-default bg-slate-100 text-slate-500'
          )}
        >
          {isSubmitting ? 'Analyzing...' : 'See my recommendations'}
        </button>
      </div>
    </div>
  )
}
