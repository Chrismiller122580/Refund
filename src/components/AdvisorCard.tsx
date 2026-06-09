import type { FreedomRecommendation } from '../lib/calculators/recommendation'
import { formatCurrency } from '../lib/format'

interface AdvisorCardProps {
  recommendation: FreedomRecommendation
}

export function AdvisorCard({ recommendation }: AdvisorCardProps) {
  const isNegative =
    recommendation.recommended === 'days'
      ? recommendation.daysTotal < 0
      : recommendation.recommended === 'miles'
        ? recommendation.milesTotal < 0
        : recommendation.milesTotal < 0 && recommendation.daysTotal < 0

  const title =
    recommendation.recommended === 'equivalent'
      ? 'Both paths are equivalent'
      : recommendation.recommended === 'days'
        ? 'Recommended: Refund per Days'
        : 'Recommended: Refund per Miles'

  return (
    <div
      className={`rounded-xl border p-4 ${
        recommendation.milesDisqualified
          ? 'border-amber-300 bg-amber-50'
          : 'border-emerald-200 bg-emerald-50'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {isNegative && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Negative refund
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-700">{recommendation.message}</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <dt className="text-slate-500">Miles path total</dt>
        <dd className="text-right font-medium text-slate-800">{formatCurrency(recommendation.milesTotal)}</dd>
        <dt className="text-slate-500">Days path total</dt>
        <dd className="text-right font-medium text-slate-800">{formatCurrency(recommendation.daysTotal)}</dd>
      </dl>
    </div>
  )
}
