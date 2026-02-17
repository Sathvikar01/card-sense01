// Multi-step questionnaire stepper component

'use client'

import { useBeginnerFlowStore } from '@/lib/store/beginner-flow-store'
import { PersonalStep } from './personal-step'
import { IncomeStep } from './income-step'
import { BankingStep } from './banking-step'
import { SpendingStep } from './spending-step'
import { GoalsStep } from './goals-step'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 0, title: 'Personal', component: PersonalStep },
  { id: 1, title: 'Income', component: IncomeStep },
  { id: 2, title: 'Banking', component: BankingStep },
  { id: 3, title: 'Spending', component: SpendingStep },
  { id: 4, title: 'Goals', component: GoalsStep },
]

interface QuestionnaireStepperProps {
  onComplete: () => void
}

export function QuestionnaireStepper({ onComplete }: QuestionnaireStepperProps) {
  const { currentStep, setStep, age, city, primaryBank, goals } = useBeginnerFlowStore()

  const CurrentStepComponent = STEPS[currentStep].component
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const canGoNext = () => {
    switch (currentStep) {
      case 0: // Personal step
        return age >= 18 && age <= 65 && city.trim().length > 0
      case 1: // Income step
        return true // Monthly income has default value
      case 2: // Banking step
        return primaryBank.trim().length > 0
      case 3: // Spending step
        return true // Spending can be zero
      case 4: // Goals step
        return goals.length > 0
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setStep(currentStep + 1)
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleStepClick = (stepId: number) => {
    // Allow jumping to previous steps or next step if current is valid
    if (stepId < currentStep || (stepId === currentStep + 1 && canGoNext())) {
      setStep(stepId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-gray-500">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicator */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isClickable = index < currentStep || (index === currentStep + 1 && canGoNext())

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && handleStepClick(index)}
                  disabled={!isClickable && index !== currentStep}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    isActive && 'bg-blue-600 text-white ring-4 ring-blue-100',
                    isCompleted && 'bg-green-600 text-white',
                    !isActive && !isCompleted && 'bg-gray-200 text-gray-500',
                    isClickable && !isActive && 'hover:bg-gray-300 cursor-pointer'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isActive && 'text-blue-600',
                    isCompleted && 'text-green-600',
                    !isActive && !isCompleted && 'text-gray-500'
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 rounded-full transition-all',
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'h-2 rounded-full transition-all',
                index === currentStep && 'w-8 bg-blue-600',
                index < currentStep && 'w-8 bg-green-600',
                index > currentStep && 'w-2 bg-gray-300'
              )}
            />
          ))}
        </div>
        <p className="text-center text-sm font-medium text-gray-600 mt-2">
          {STEPS[currentStep].title}
        </p>
      </div>

      {/* Current Step Content */}
      <div className="min-h-[400px]">
        <CurrentStepComponent />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canGoNext()}
          className="gap-2"
        >
          {currentStep === STEPS.length - 1 ? (
            <>
              Get Recommendations
              <Check className="h-4 w-4" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Validation hint */}
      {!canGoNext() && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
          <p className="text-sm text-amber-800">
            Please complete all required fields to continue
          </p>
        </div>
      )}
    </div>
  )
}
