'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCibilScoreRating } from '@/lib/credit-score'
import { GOLD, PINE_70 } from '@/lib/theme'

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
  const [scoreSource, setScoreSource] = useState('manual')
  const [notes, setNotes] = useState('')

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
        tickLabel: format(parsed, 'MMM dd'),
        score: entry.credit_score,
        fullDateLabel: format(parsed, 'MMM dd, yyyy'),
        scoreSource: entry.score_source || 'manual',
      }
    })
  }, [history])

  const latestScore = chartData.length > 0
    ? chartData[chartData.length - 1]
    : null

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
      setScoreSource('manual')
      setNotes('')
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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="source">Source</Label>
              <Select value={scoreSource} onValueChange={setScoreSource}>
                <SelectTrigger id="source" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cibil">CIBIL</SelectItem>
                  <SelectItem value="experian">Experian</SelectItem>
                  <SelectItem value="equifax">Equifax</SelectItem>
                  <SelectItem value="crif">CRIF</SelectItem>
                  <SelectItem value="manual">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Optional"
                className="h-10"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
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
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">No score yet</p>
        {addScoreDialog}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top bar: current score + add button */}
      <div className="flex items-start justify-between gap-4">
        {latestScore && (
          <div>
            <p className="text-3xl font-semibold tabular-nums tracking-tight">{latestScore.score}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {getCibilScoreRating(latestScore.score)} · {latestScore.fullDateLabel}
            </p>
          </div>
        )}
        {addScoreDialog}
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="xKey"
              stroke={PINE_70}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(_, index) => chartData[index]?.tickLabel || ''}
            />
            <YAxis
              domain={[300, 900]}
              stroke={PINE_70}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip
              labelFormatter={(_, payload) => {
                const point = payload?.[0]?.payload as { fullDateLabel?: string; scoreSource?: string } | undefined
                if (!point) return ''
                return point.scoreSource ? `${point.fullDateLabel} · ${point.scoreSource}` : (point.fullDateLabel || '')
              }}
              formatter={(value) => [`${value}`, 'Score']}
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={GOLD}
              strokeWidth={2}
              dot={{ fill: GOLD, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: GOLD, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
