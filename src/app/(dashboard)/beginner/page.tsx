'use client'

import { useState } from 'react'
import { QuestionnaireStepper } from '@/components/beginner/questionnaire-stepper'
import { useBeginnerFlowStore } from '@/lib/store/beginner-flow-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

type BeginnerStep = 'input' | 'loading' | 'results'

interface BeginnerResult {
  recommendations: Array<{
    cardId: string
    cardName: string
    bank: string
    score: number
    reasoning: string
    annualValue?: number
    keyPerks?: string[]
    benefitSummary?: string[]
  }>
  overall_analysis?: string
}

export default function BeginnerPage() {
  const { toBeginnerInput, reset } = useBeginnerFlowStore()
  const [step, setStep] = useState<BeginnerStep>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BeginnerResult | null>(null)

  const handleComplete = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setStep('loading')

      // Convert store state to API format
      const beginnerInput = toBeginnerInput()

      // Call AI API endpoint
      const response = await fetch('/api/ai/beginner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(beginnerInput),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to get recommendations: ${response.statusText}`)
      }

      const data = await response.json()

      // Success! Show success message
      toast.success('Recommendations generated!')
      const recommendationPayload = (data.data ?? data) as BeginnerResult
      setResult(recommendationPayload)
      setStep('results')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendations'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error getting recommendations:', err)
      setStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to start over? All your answers will be cleared.')) {
      reset()
      setStep('input')
      setResult(null)
      setError(null)
      toast.info('Questionnaire reset')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            Beginner Credit Card Advisor
          </h1>
          <p className="text-gray-600 mt-2">
            Answer a few questions to get personalized credit card recommendations
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Loading State */}
      {step === 'loading' && isLoading && (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Analyzing your profile...
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our AI is finding the best credit cards for you
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-500 text-center">
                <p>Evaluating eligibility criteria...</p>
                <p>Matching with available cards...</p>
                <p>Calculating potential rewards...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && step === 'input' && !isLoading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900">
                  Failed to get recommendations
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questionnaire */}
      {step === 'input' && !isLoading && !error && (
        <QuestionnaireStepper onComplete={handleComplete} />
      )}

      {/* Results */}
      {step === 'results' && result && (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-green-900">
                Recommendations Ready
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Top {result.recommendations.length} beginner-friendly cards for your profile are ready.
              </p>
            </CardContent>
          </Card>

          {result.overall_analysis && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Analysis</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.overall_analysis}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {result.recommendations.map((card, index) => (
              <Card key={card.cardId}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-blue-600">Rank {index + 1}</p>
                      <h4 className="text-lg font-semibold text-gray-900">{card.cardName}</h4>
                      <p className="text-sm text-gray-600">{card.bank}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Match Score</p>
                      <p className="text-2xl font-bold text-blue-600">{card.score}%</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-4">
                    <span className="font-medium text-gray-900">Why this suits you:</span> {card.reasoning}
                  </p>
                  {typeof card.annualValue === 'number' && (
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium text-gray-900">Estimated annual net value:</span>{' '}
                      INR {card.annualValue.toLocaleString('en-IN')}
                    </p>
                  )}
                  {Array.isArray(card.keyPerks) && card.keyPerks.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 mb-1">Key perks you get</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {card.keyPerks.map((perk, perkIndex) => (
                          <li key={`${card.cardId}-perk-${perkIndex}`}>{perk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(card.benefitSummary) && card.benefitSummary.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 mb-1">How this benefits you</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {card.benefitSummary.map((benefit, benefitIndex) => (
                          <li key={`${card.cardId}-benefit-${benefitIndex}`}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={handleReset} variant="outline">
            Start Over
          </Button>
        </div>
      )}

      {/* Helper Info */}
      {step === 'input' && !isLoading && !error && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900">
                  Why we ask these questions
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  We use your income, spending patterns, and goals to recommend credit cards with the highest approval chances and best rewards for your lifestyle. Your information is never shared with third parties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Note */}
      {step === 'input' && !isLoading && (
        <p className="text-xs text-gray-500 text-center">
          Your data is stored locally and used only for generating recommendations. We do not share your personal information with card issuers without your consent.
        </p>
      )}
    </div>
  )
}
