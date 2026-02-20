'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

  // Determine score color based on range
  const getScoreColor = (score: number) => {
    if (score >= 750) return '#2563eb' // Excellent
    if (score >= 700) return '#3b82f6' // Good
    if (score >= 650) return '#60a5fa' // Fair
    return '#dc2626' // Poor
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
        // Score was saved to profile but history table is unavailable
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

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            CIBIL Score History
          </CardTitle>
          <CardDescription>Track your credit score over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No CIBIL Score History
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Start tracking your credit score to monitor your credit health and see improvements
              over time.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Score
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add CIBIL Score</DialogTitle>
                  <DialogDescription>
                    Enter your credit score to start tracking your credit health
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="score">
                      CIBIL Score <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="score"
                      type="number"
                      min={300}
                      max={900}
                      placeholder="e.g., 750"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Score must be between 300 and 900</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">
                      Score Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={scoreDate}
                      onChange={(e) => setScoreDate(e.target.value)}
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="source">Source</Label>
                    <Select value={scoreSource} onValueChange={setScoreSource}>
                      <SelectTrigger id="source">
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
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Any additional notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
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
                  <Button onClick={handleAddScore} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Adding...' : 'Add Score'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              CIBIL Score History
            </CardTitle>
            <CardDescription>Track your credit score over time</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Score
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add CIBIL Score</DialogTitle>
                <DialogDescription>
                  Enter your credit score to continue tracking your credit health
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="score">
                    CIBIL Score <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    min={300}
                    max={900}
                    placeholder="e.g., 750"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Score must be between 300 and 900</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">
                    Score Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={scoreDate}
                    onChange={(e) => setScoreDate(e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={scoreSource} onValueChange={setScoreSource}>
                    <SelectTrigger id="source">
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
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any additional notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
                <Button onClick={handleAddScore} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Adding...' : 'Add Score'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Latest Score Display */}
        {latestScore && (
          <div className="mb-6 rounded-lg border border-border bg-gradient-to-r from-secondary/70 to-accent/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Score</p>
                <p className="text-3xl font-bold" style={{ color: getScoreColor(latestScore.credit_score) }}>
                  {latestScore.credit_score}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  as of {format(new Date(latestScore.score_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {latestScore.credit_score >= 750 ? 'Excellent' :
                   latestScore.credit_score >= 700 ? 'Good' :
                   latestScore.credit_score >= 650 ? 'Fair' : 'Poor'}
                </p>
                {latestScore.score_source && (
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    Source: {latestScore.score_source}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis
                domain={[300, 900]}
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Score Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#dc2626]"></div>
            <span className="text-gray-600">300-649: Poor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#60a5fa]"></div>
            <span className="text-gray-600">650-699: Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#3b82f6]"></div>
            <span className="text-gray-600">700-749: Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#2563eb]"></div>
            <span className="text-gray-600">750-900: Excellent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
