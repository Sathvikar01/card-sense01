'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCibilScoreRating } from '@/lib/credit-score'

interface CibilHistoryEntry {
  id: string
  credit_score: number
  score_date: string
  score_source: string | null
  notes: string | null
}

interface CibilHistoryChartProps {
  history: CibilHistoryEntry[]
  onUpdate?: () => void
}

function parseScoreDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00Z`)
  }
  return new Date(value)
}

export function CibilHistoryChart({ history, onUpdate }: CibilHistoryChartProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newScore, setNewScore] = useState('')
  const [scoreDate, setScoreDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const scoreSource = 'manual'
  const notes = ''

  const chartData = useMemo(() => {
    const sorted = [...history].sort((a, b) => {
      const diff = parseScoreDate(a.score_date).getTime() - parseScoreDate(b.score_date).getTime()
      if (diff !== 0) return diff
      return a.id.localeCompare(b.id)
    })

    return sorted.map((entry, index) => {
      const parsed = parseScoreDate(entry.score_date)
      return {
        xKey: `${entry.score_date}-${entry.id}-${index}`,
        score: entry.credit_score,
        fullDateLabel: format(parsed, 'MMM dd, yyyy'),
        scoreSource: entry.score_source || 'manual',
      }
    })
  }, [history])

  const handleAddScore = async () => {
    const score = parseInt(newScore)

    if (!score || score < 300 || score > 900) {
      toast.error('Score must be 300–900')
      return
    }

    if (!scoreDate) {
      toast.error('Pick a date')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/profile/cibil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credit_score: score,
          score_date: scoreDate,
          score_source: scoreSource,
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        let message = 'Failed to add CIBIL score'
        try {
          const error = (await response.json()) as { message?: string; error?: string }
          message = error.message || error.error || message
        } catch {
          // Ignore response parsing failures and fall back to generic message.
        }
        throw new Error(message)
      }

      setIsDialogOpen(false)
      setNewScore('')
      setScoreDate(format(new Date(), 'yyyy-MM-dd'))
      onUpdate?.()
    } catch (error) {
      console.error('Error adding CIBIL score:', error)
      toast.error(
        error instanceof Error ? error.message : 'Could not add score. Try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const addScoreDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={history.length === 0 ? 'default' : 'outline'}>
          Add score
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add score</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                type="number"
                min={300}
                max={900}
                placeholder="750"
                className="h-10"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                className="h-10"
                value={scoreDate}
                onChange={(e) => setScoreDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddScore}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding…' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-between gap-4 py-3">
        <p className="text-sm text-muted-foreground">No score yet</p>
        {addScoreDialog}
      </div>
    )
  }

  // Newest first; the top row is the current score.
  const rows = [...chartData].reverse()

  return (
    <div>
      <ul>
        {rows.map((entry, i) => (
          <li key={entry.xKey} className="row py-2.5">
            <span className={i === 0 ? 'text-2xl font-semibold tabular-nums' : 'tabular-nums'}>{entry.score}</span>
            <span className="flex-1 text-sm text-muted-foreground">
              {i === 0 ? `${getCibilScoreRating(entry.score)} · ` : ''}
              {entry.fullDateLabel}
            </span>
          </li>
        ))}
      </ul>
      <div className="pt-3">{addScoreDialog}</div>
    </div>
  )
}
