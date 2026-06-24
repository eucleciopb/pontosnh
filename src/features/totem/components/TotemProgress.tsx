import { cn } from '@/lib/utils'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface TotemProgressProps {
  currentStep: number
  totalSteps: number
  stepLabel: string
  steps?: readonly { label: string }[]
  className?: string
}

export function TotemProgress({
  currentStep,
  totalSteps,
  stepLabel,
  steps,
  className,
}: TotemProgressProps) {
  const progressValue = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 100

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-nh-gray-600">
          Passo {currentStep} de {totalSteps}
        </span>
        <span className="font-semibold text-nh-green-700">{stepLabel}</span>
      </div>

      <ProgressBar
        value={progressValue}
        max={100}
        colorClass="bg-gradient-to-r from-nh-green-500 to-nh-green-600"
      />

      {steps && steps.length > 0 && (
        <div className="mt-3 hidden justify-between sm:flex">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isActive = stepNumber === currentStep
            const isDone = stepNumber < currentStep

            return (
              <div
                key={step.label}
                className={cn(
                  'flex flex-col items-center gap-1 text-xs',
                  isActive && 'font-semibold text-nh-green-700',
                  isDone && 'text-nh-green-600',
                  !isActive && !isDone && 'text-nh-gray-400',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                    isActive && 'bg-nh-green-600 text-white',
                    isDone && 'bg-nh-green-100 text-nh-green-700',
                    !isActive && !isDone && 'bg-nh-gray-100 text-nh-gray-400',
                  )}
                >
                  {isDone ? '✓' : stepNumber}
                </span>
                <span>{step.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
