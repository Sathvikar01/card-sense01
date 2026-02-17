'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Award } from 'lucide-react'

interface CreditScoreInputProps {
  score: number | null
  onScoreChange: (score: number | null) => void
  lastUpdated: Date | null
  onLastUpdatedChange: (date: Date | null) => void
}

export function CreditScoreInput({
  score,
  onScoreChange,
  lastUpdated,
  onLastUpdatedChange,
}: CreditScoreInputProps) {
  const getScoreColor = (s: number) => {
    if (s < 650) return 'text-red-600'
    if (s < 750) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getScoreLabel = (s: number) => {
    if (s < 550) return 'Poor'
    if (s < 650) return 'Fair'
    if (s < 750) return 'Good'
    if (s < 800) return 'Very Good'
    return 'Excellent'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          CIBIL Score
        </CardTitle>
        <CardDescription>
          Enter your CIBIL score if available. If you are new to credit, you can leave this blank.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Score Gauge */}
          <div className="relative w-36 h-20 mx-auto sm:mx-0">
            <svg viewBox="0 0 200 110" className="w-full h-full">
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {score && (
                <path
                  d={`M 20 100 A 80 80 0 ${
                    ((score - 300) / 600) * 180 > 90 ? '1' : '0'
                  } 1 ${
                    100 +
                    80 *
                      Math.cos(
                        (270 - ((score - 300) / 600) * 180) * (Math.PI / 180)
                      )
                  } ${
                    100 -
                    80 *
                      Math.sin(
                        (270 - ((score - 300) / 600) * 180) * (Math.PI / 180)
                      )
                  }`}
                  fill="none"
                  stroke={score < 650 ? '#ef4444' : score < 750 ? '#eab308' : '#22c55e'}
                  strokeWidth="14"
                  strokeLinecap="round"
                />
              )}
              <text x="100" y="85" textAnchor="middle" className="text-2xl font-bold" fill="#1f2937">
                {score || '---'}
              </text>
              <text x="100" y="105" textAnchor="middle" className="text-xs" fill="#6b7280">
                {score ? getScoreLabel(score) : 'Enter score'}
              </text>
            </svg>
          </div>

          {/* Input */}
          <div className="flex-1 space-y-3 w-full">
            <div>
              <Label htmlFor="cibil-score">Your CIBIL Score (300-900, optional)</Label>
              <Input
                id="cibil-score"
                type="number"
                min={300}
                max={900}
                placeholder="e.g. 750"
                value={score ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (!val) {
                    onScoreChange(null)
                    onLastUpdatedChange(new Date())
                    return
                  }
                  const num = parseInt(val, 10)
                  if (num >= 300 && num <= 900) {
                    onScoreChange(num)
                    onLastUpdatedChange(new Date())
                  }
                }}
                className="max-w-[200px]"
              />
            </div>
            {score && (
              <p className={`text-sm font-medium ${getScoreColor(score)}`}>
                Your score is {getScoreLabel(score)} ({score}/900)
              </p>
            )}
            <p className="text-xs text-gray-500">
              If left blank, we use a neutral score for guidance. Check free score at myscore.cibil.com.
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleDateString('en-IN')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
