'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Plus, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const SCORE_RANGES = [
  { min: 750, max: 900, label: 'Excellent', color: '#2563eb', bg: 'bg-[#2563eb]' },
  { min: 700, max: 749, label: 'Good', color: '#3b82f6', bg: 'bg-[#3b82f6]' },
  { min: 650, max: 699, label: 'Fair', color: '#f59e0b', bg: 'bg-[#f59e0b]' },
  { min: 300, max: 649, label: 'Poor', color: '#dc2626', bg: 'bg-[#dc2626]' },
]

export function CibilHistoryChart({ history, onUpdate }: CibilHistoryChartProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newScore, setNewScore] = useState('')
  const [scoreDate, setScoreDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [scoreSource, setScoreSource] = useState('manual')
  const [notes, setNotes] = useState('')

  // Transform data for Recharts
  const chartData = history
    .map((entry) => ({
      date: format(new Date(entry.score_date), 'MMM yy'),
      score: entry.credit_score,
      fullDate: entry.score_date,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())

  const getScoreColor = (score: number) => {
    if (score >= 750) return '#2563eb'
    if (score >= 700) return '#3b82f6'
    if (score >= 650) return '#f59e0b'
    return '#dc2626'
  }

  const latestScore = history.length > 0
    ? history.reduce((latest, entry) =>
        new Date(entry.score_date) > new Date(latest.score_date) ? entry : latest
      )
    : null

  const handleAddScore = async () => {
    const score = parseInt(newScore)

    if (!score || score < 300 || score > 900) {
      toast.error('Please enter a valid CIBIL score between 300 and 900')
      return
    }

    if (!scoreDate) {
      toast.error('Please select a score date')
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

      const data = await response.json() as { warning?: string; entry?: unknown; message?: string }

      if (data.warning) {
        toast.success('CIBIL score saved to your profile')
      } else {
        toast.success('CIBIL score added successfully')
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
        error instanceof Error ? error.message : 'Failed to add CIBIL score. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const addScoreDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white shadow-sm hover:shadow-md"
        >
          <Plus className="h-3.5 w-3.5" />
          {history.length === 0 ? 'Add Your First Score' : 'Add Score'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add CIBIL Score</DialogTitle>
          <DialogDescription>
            {history.length === 0
              ? 'Enter your credit score to start tracking your credit health'
              : 'Enter your credit score to continue tracking your credit health'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="score" className="text-xs text-muted-foreground">
                CIBIL Score <span className="text-red-500">*</span>
              </Label>
              <Input
                id="score"
                type="number"
                min={300}
                max={900}
                placeholder="e.g., 750"
                className="h-10"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
              />
              <p className="text-[0.7rem] text-muted-foreground">Between 300 and 900</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-xs text-muted-foreground">
                Score Date <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="source" className="text-xs text-muted-foreground">Source</Label>
              <Select value={scoreSource} onValueChange={setScoreSource}>
                <SelectTrigger id="source" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cibil">CIBIL Report</SelectItem>
                  <SelectItem value="experian">Experian</SelectItem>
                  <SelectItem value="equifax">Equifax</SelectItem>
                  <SelectItem value="crif">CRIF</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-xs text-muted-foreground">Notes</Label>
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
            className="gap-1.5 bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {isSubmitting ? 'Adding...' : 'Add Score'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/10 to-orange-500/10 mb-4">
          <TrendingUp className="h-7 w-7 text-[#d4a017]/50" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No CIBIL Score History</p>
        <p className="text-xs text-muted-foreground mb-5 max-w-xs">
          Start tracking your credit score to monitor improvements over time
        </p>
        {addScoreDialog}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top bar: current score + add button */}
      <div className="flex items-start justify-between gap-4">
        {latestScore && (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Current Score</p>
              <p className="text-3xl font-bold tabular-nums" style={{ color: getScoreColor(latestScore.credit_score) }}>
                {latestScore.credit_score}
              </p>
            </div>
            <div className="h-10 w-px bg-border/60" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Rating</p>
              <p className="text-sm font-semibold text-foreground">
                {latestScore.credit_score >= 750 ? 'Excellent' :
                 latestScore.credit_score >= 700 ? 'Good' :
                 latestScore.credit_score >= 650 ? 'Fair' : 'Poor'}
              </p>
              <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                {format(new Date(latestScore.score_date), 'MMM dd, yyyy')}
                {latestScore.score_source && ` \u00b7 ${latestScore.score_source}`}
              </p>
            </div>
          </div>
        )}
        {addScoreDialog}
      </div>

      {/* Chart */}
      <div className="h-56 rounded-xl border border-border/40 bg-muted/20 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[300, 900]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Score Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SCORE_RANGES.map((range) => (
          <div key={range.label} className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${range.bg}`} />
            <span className="text-xs text-muted-foreground">
              {range.min}-{range.max}: {range.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
