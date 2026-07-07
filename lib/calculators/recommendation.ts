import type { FreedomInputs, FreedomResults } from './freedom'
import type { ValidationWarning } from './validation'

export type RefundPath = 'miles' | 'days'

export interface FreedomRecommendation {
  recommended: RefundPath | 'equivalent'
  milesTotal: number
  daysTotal: number
  difference: number
  milesDisqualified: boolean
  milesDisqualifyReason?: string
  message: string
}

export function getFreedomRecommendation(
  results: FreedomResults,
  warnings: ValidationWarning[],
  inputs: FreedomInputs,
): FreedomRecommendation {
  const milesTotal = results.refundPerMiles.totalCustomerReceives
  const daysTotal = results.refundPerDays.totalCustomerReceives
  const difference = Math.abs(daysTotal - milesTotal)

  if (inputs.unlimitedMileage) {
    const reason = 'Unlimited mileage product — refund is calculated by time only.'
    return {
      recommended: 'days',
      milesTotal,
      daysTotal,
      difference,
      milesDisqualified: true,
      milesDisqualifyReason: reason,
      message: `Use the days-based path. ${reason}`,
    }
  }

  const mileCapWarning = warnings.find((w) => w.id === 'mile-cap-exceeded')
  const negativeMilesWarning = warnings.find((w) => w.id === 'negative-miles-driven')
  const milesDisqualified = Boolean(mileCapWarning || negativeMilesWarning)

  if (milesDisqualified) {
    const reason = mileCapWarning?.message ?? negativeMilesWarning?.message
    return {
      recommended: 'days',
      milesTotal,
      daysTotal,
      difference,
      milesDisqualified: true,
      milesDisqualifyReason: reason,
      message: `Use the days-based path. The mileage path is invalid: ${reason}`,
    }
  }

  if (difference < 1) {
    return {
      recommended: 'equivalent',
      milesTotal,
      daysTotal,
      difference,
      milesDisqualified: false,
      message: 'Both paths yield roughly the same total refund.',
    }
  }

  const recommended: RefundPath = daysTotal > milesTotal ? 'days' : 'miles'
  const winner = recommended === 'days' ? 'Refund per Days' : 'Refund per Miles'
  const winnerTotal = recommended === 'days' ? daysTotal : milesTotal
  const loserTotal = recommended === 'days' ? milesTotal : daysTotal
  const loser = recommended === 'days' ? 'Refund per Miles' : 'Refund per Days'

  return {
    recommended,
    milesTotal,
    daysTotal,
    difference,
    milesDisqualified: false,
    message: `${winner} is recommended. Customer receives ${formatAmt(winnerTotal)} vs ${formatAmt(loserTotal)} on the ${loser} path — a ${formatAmt(difference)} difference.`,
  }
}

function formatAmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
