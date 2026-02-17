'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUploadZone } from '@/components/advisor/file-upload-zone'
import { CreditScoreInput } from '@/components/advisor/credit-score-input'
import { FinancialProfileForm, type FinancialProfileFormData } from '@/components/advisor/financial-profile-form'
import { Brain, Loader2, AlertCircle, CheckCircle2, Sparkles, ArrowLeft, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type FlowStep = 'input' | 'loading' | 'questions' | 'results'

interface UploadedFileData {
  file: File
  analysis?: {
    totalSpending: number
    categoryBreakdown: Record<string, number>
    topMerchants: Array<{ name: string; amount: number }>
  }
}

interface RecommendationResult {
  cards: Array<{
    id: string
    name: string
    bank: string
    score: number
    reason: string
  }>
  analysis: string
}

interface FollowUpQuestion {
  id: string
  question: string
  why: string
  options: Array<{
    value: string
    label: string
    description: string
  }>
}

export default function AdvisorPage() {
  const [step, setStep] = useState<FlowStep>('input')
  const [uploadedFile, setUploadedFile] = useState<UploadedFileData | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [cibilScore, setCibilScore] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessages, setLoadingMessages] = useState<string[]>([])
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([])
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({})
  const [pendingInput, setPendingInput] = useState<Record<string, unknown> | null>(null)

  // Handle file upload
  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setUploadedFile(null)
      setUploadProgress(0)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Upload file
      const response = await fetch('/api/upload/bank-statement', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to upload file')
      }

      const data = await response.json()

      setUploadProgress(100)
      setUploadedFile({
        file,
        analysis: data.analysis,
      })

      toast.success('File uploaded and analyzed successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file'
      setError(errorMessage)
      toast.error(errorMessage)
      setUploadedFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle form submission
  const handleFormSubmit = async (formData: FinancialProfileFormData) => {
    const effectiveCibilScore = cibilScore ?? 650
    if (!cibilScore) {
      toast.info('No CIBIL score provided. Using neutral score 650 for recommendation guidance.')
    }

    setIsSubmitting(true)
    setError(null)
    setStep('loading')
    setLoadingMessages([])

    // Show progressive loading messages
    const messages = [
      'Analyzing your financial profile...',
      'Evaluating credit eligibility...',
      'Matching with available cards...',
      'Calculating potential rewards...',
      'Optimizing recommendations...',
    ]

    let messageIndex = 0
    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        setLoadingMessages((prev) => [...prev, messages[messageIndex]])
        messageIndex++
      } else {
        clearInterval(messageInterval)
      }
    }, 1000)

    try {
      // Prepare experienced user input
      const experiencedInput = {
        cibilScore: effectiveCibilScore,
        monthlyIncome: formData.annualIncome / 12,
        annualIncome: formData.annualIncome,
        employmentType: formData.employmentType.toLowerCase().replace(' ', '_'),
        primaryBank: formData.primaryBank,
        city: formData.city,
        existingCards: formData.existingCards,
        hasFixedDeposits: (formData.fdAmount || 0) > 0,
        fdAmount: formData.fdAmount || 0,
        monthlySpending: Object.values(formData.spending).reduce((sum, val) => sum + val, 0),
        spendingBreakdown: formData.spending,
        creditGoals: formData.goals,
        // Include uploaded file analysis if available
        parsedStatement: uploadedFile?.analysis ? {
          totalSpending: uploadedFile.analysis.totalSpending,
          categoryBreakdown: uploadedFile.analysis.categoryBreakdown,
        } : undefined,
      }

      // Call AI API
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experiencedInput),
      })

      clearInterval(messageInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to get recommendations: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status === 'needs_more_info') {
        const questions = Array.isArray(data.questions) ? (data.questions as FollowUpQuestion[]) : []
        if (questions.length === 0) {
          throw new Error('Failed to generate follow-up questions')
        }

        setPendingInput(experiencedInput as unknown as Record<string, unknown>)
        setFollowUpQuestions(questions)
        setFollowUpAnswers({})
        setStep('questions')
        toast.info('Answer a few quick questions for precise recommendations')
        return
      }

      setRecommendations({
        cards: data.cards || [],
        analysis: data.analysis || '',
      })
      setStep('results')
      toast.success('Recommendations generated successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendations'
      setError(errorMessage)
      toast.error(errorMessage)
      setStep('input')
    } finally {
      setIsSubmitting(false)
      clearInterval(messageInterval)
    }
  }

  const handleFollowUpAnswerChange = (questionId: string, answer: string) => {
    setFollowUpAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleFollowUpSubmit = async () => {
    if (!pendingInput || followUpQuestions.length === 0) {
      setStep('input')
      return
    }

    const unanswered = followUpQuestions.filter((question) => !followUpAnswers[question.id])
    if (unanswered.length > 0) {
      toast.error('Please answer all follow-up questions')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setStep('loading')
    setLoadingMessages([
      'Refining your profile with follow-up preferences...',
      'Scoring cards based on your exact requirements...',
      'Finalizing the most relevant recommendations...',
    ])

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pendingInput,
          followUpAnswers,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to get recommendations: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.status !== 'success') {
        throw new Error('Recommendation response was incomplete')
      }

      setRecommendations({
        cards: data.cards || [],
        analysis: data.analysis || '',
      })
      setStep('results')
      toast.success('Recommendations generated successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendations'
      setError(errorMessage)
      toast.error(errorMessage)
      setStep('questions')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartOver = () => {
    setStep('input')
    setUploadedFile(null)
    setUploadProgress(0)
    setCibilScore(null)
    setLastUpdated(null)
    setRecommendations(null)
    setError(null)
    setLoadingMessages([])
    setFollowUpQuestions([])
    setFollowUpAnswers({})
    setPendingInput(null)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            Smart Advisor
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced credit card analysis powered by AI
          </p>
        </div>
        {step === 'results' && (
          <Button variant="outline" onClick={handleStartOver} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Start Over
          </Button>
        )}
      </div>

      {/* Loading State */}
      {step === 'loading' && (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-6">
              <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Analyzing Your Profile
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Our AI is finding the perfect credit cards for you
                </p>
              </div>
              <div className="space-y-2 w-full max-w-md">
                {loadingMessages.map((message, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700 animate-in fade-in slide-in-from-left-4"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{message}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (step === 'input' || step === 'questions') && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900">
                  Failed to process request
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                  className="mt-3"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Step */}
      {step === 'input' && (
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile & Spending</TabsTrigger>
            <TabsTrigger value="upload">Upload Statement (Optional)</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* CIBIL Score Input */}
            <CreditScoreInput
              score={cibilScore}
              onScoreChange={setCibilScore}
              lastUpdated={lastUpdated}
              onLastUpdatedChange={setLastUpdated}
            />

            {/* Financial Profile Form */}
            <FinancialProfileForm
              onSubmit={handleFormSubmit}
              isLoading={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            {/* File Upload */}
            <FileUploadZone
              file={uploadedFile?.file || null}
              onFileSelect={handleFileSelect}
              uploading={isUploading}
              progress={uploadProgress}
            />

            {/* Analysis Preview */}
            {uploadedFile?.analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Spending Analysis
                  </CardTitle>
                  <CardDescription>
                    Insights from your uploaded statement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Total Monthly Spending
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        ₹{uploadedFile.analysis.totalSpending.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {uploadedFile.analysis.topMerchants.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Top Merchants
                        </p>
                        <div className="space-y-2">
                          {uploadedFile.analysis.topMerchants.slice(0, 5).map((merchant, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{merchant.name}</span>
                              <span className="font-semibold text-gray-900">
                                ₹{merchant.amount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-purple-900 font-medium">
                      Why upload a bank statement?
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
                      We&apos;ll analyze your actual spending patterns to provide more accurate card recommendations. Your data is processed securely and never stored.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Follow-up Questions Step */}
      {step === 'questions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Final Preference Questions
            </CardTitle>
            <CardDescription>
              Answer these to improve recommendation precision from the India cards guide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {followUpQuestions.map((question) => (
              <div key={question.id} className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{question.question}</p>
                  <p className="text-xs text-gray-500 mt-1">{question.why}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.options.map((option) => {
                    const selected = followUpAnswers[question.id] === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleFollowUpAnswerChange(question.id, option.value)}
                        className={cn(
                          'rounded-lg border p-3 text-left transition-colors',
                          selected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <p className="text-sm font-medium text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button onClick={handleFollowUpSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Recommendations'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Step */}
      {step === 'results' && recommendations && (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Recommendations Ready!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Based on your profile, we&apos;ve found {recommendations.cards.length} cards that match your needs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {recommendations.analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {recommendations.analysis}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recommended Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recommended Cards
            </h2>
            {recommendations.cards.map((card, index) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm font-bold">
                          {index + 1}
                        </span>
                        {card.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {card.bank}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Match Score</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {card.score}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{card.reason}</p>
                  <Button className="mt-4 w-full">
                    View Card Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Helper Info - Only show in input step */}
      {step === 'input' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900">
                  How it works
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Our AI analyzes your credit score, income/support profile, spending patterns, and goals to recommend credit cards with:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Highest approval probability based on your CIBIL score</li>
                  <li>Best rewards for your spending categories</li>
                  <li>Optimal fees and benefits for your profile</li>
                  <li>Cards that align with your financial goals</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
