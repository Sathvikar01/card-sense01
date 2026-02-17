'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface CibilScoreGaugeProps {
  score: number
  lastUpdated?: string
}

export function CibilScoreGauge({ score, lastUpdated }: CibilScoreGaugeProps) {
  // Clamp score between 300-900
  const clampedScore = Math.max(300, Math.min(900, score))

  // Calculate percentage and angle for gauge (semicircle, 180 degrees)
  const percentage = ((clampedScore - 300) / 600) * 100
  const angle = (percentage / 100) * 180

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score < 650) return '#ef4444' // red-500
    if (score < 750) return '#eab308' // yellow-500
    return '#22c55e' // green-500
  }

  // Determine quality label
  const getScoreQuality = (score: number) => {
    if (score < 550) return 'Poor'
    if (score < 650) return 'Fair'
    if (score < 750) return 'Good'
    if (score < 800) return 'Very Good'
    return 'Excellent'
  }

  const color = getScoreColor(clampedScore)
  const quality = getScoreQuality(clampedScore)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">CIBIL Score</CardTitle>
        <Award className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* SVG Gauge */}
          <div className="relative w-48 h-28 mb-4">
            <svg
              viewBox="0 0 200 110"
              className="w-full h-full"
            >
              {/* Background arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Red segment (300-650) */}
              <path
                d="M 20 100 A 80 80 0 0 1 100 20"
                fill="none"
                stroke="#fecaca"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* Yellow segment (650-750) */}
              <path
                d="M 100 20 A 80 80 0 0 1 156.57 56.57"
                fill="none"
                stroke="#fef08a"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* Green segment (750-900) */}
              <path
                d="M 156.57 56.57 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#bbf7d0"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* Score indicator arc */}
              <path
                d={`M 20 100 A 80 80 0 ${angle > 90 ? '1' : '0'} 1 ${
                  100 + 80 * Math.cos((270 - angle) * Math.PI / 180)
                } ${
                  100 - 80 * Math.sin((270 - angle) * Math.PI / 180)
                }`}
                fill="none"
                stroke={color}
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Center circle */}
              <circle
                cx="100"
                cy="100"
                r="50"
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="1"
              />

              {/* Score text */}
              <text
                x="100"
                y="90"
                textAnchor="middle"
                className="text-3xl font-bold"
                fill="#1f2937"
              >
                {clampedScore}
              </text>

              {/* Quality label */}
              <text
                x="100"
                y="110"
                textAnchor="middle"
                className="text-sm"
                fill="#6b7280"
              >
                {quality}
              </text>
            </svg>

            {/* Range labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
              <span>300</span>
              <span>900</span>
            </div>
          </div>

          {/* Last updated */}
          {lastUpdated && (
            <p className="text-xs text-gray-500 mb-3">
              Last updated: {new Date(lastUpdated).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          )}

          {/* Update button */}
          <Link href="/profile" className="w-full">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Update Score
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
