import type { ValidationWarning, WarningSeverity } from '@/lib/calculators/validation'

const styles: Record<WarningSeverity, { container: string; icon: string }> = {
  error: {
    container:
      'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
    icon: 'text-red-500 dark:text-red-400',
  },
  warning: {
    container:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    icon: 'text-amber-500 dark:text-amber-400',
  },
  info: {
    container:
      'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
    icon: 'text-blue-500 dark:text-blue-400',
  },
}

const labels: Record<WarningSeverity, string> = {
  error: 'Error',
  warning: 'Warning',
  info: 'Note',
}

interface ValidationAlertsProps {
  warnings: ValidationWarning[]
}

export function ValidationAlerts({ warnings }: ValidationAlertsProps) {
  const bannerWarnings = warnings.filter((w) => !w.field)

  if (bannerWarnings.length === 0) return null

  return (
    <div className="space-y-2">
      {bannerWarnings.map((warning) => {
        const style = styles[warning.severity]
        return (
          <div
            key={warning.id}
            className={`flex gap-2 rounded-lg border px-3 py-2.5 text-sm ${style.container}`}
            role="alert"
          >
            <span className={`mt-0.5 font-semibold ${style.icon}`}>!</span>
            <div>
              <span className="font-medium">{labels[warning.severity]}: </span>
              {warning.message}
            </div>
          </div>
        )
      })}
    </div>
  )
}