import type { FreedomInputs, FreedomResults } from './calculators/freedom'
import type { GapInputs, GapResults } from './calculators/gap'
import type { FreedomRecommendation } from './calculators/recommendation'
import type { ValidationWarning } from './calculators/validation'
import type { CaseType, SavedCase } from './storage'

export interface RecordSnapshot {
  results: FreedomResults | GapResults
  warnings: ValidationWarning[]
  recommendation?: FreedomRecommendation
}

function readTotal(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function primaryTotal(
  type: CaseType,
  results: FreedomResults | GapResults,
  recommendation?: FreedomRecommendation,
): number | null {
  if (type === 'gap') {
    return readTotal((results as GapResults).refund?.totalCustomerReceives)
  }
  const freedom = results as FreedomResults
  if (recommendation?.recommended === 'days' || recommendation?.milesDisqualified) {
    return readTotal(freedom.refundPerDays?.totalCustomerReceives)
  }
  return readTotal(freedom.refundPerMiles?.totalCustomerReceives)
}

export function formatCustomerTotal(record: SavedCase): string | null {
  if (!record.results) return null
  const total = primaryTotal(record.type, record.results, record.recommendation ?? undefined)
  if (total == null) return null
  return `$${total.toFixed(2)}`
}

export function buildSearchText(
  name: string,
  contractNumber: string | undefined,
  type: CaseType,
  inputs: FreedomInputs | GapInputs,
  results?: FreedomResults | GapResults | null,
  recommendation?: FreedomRecommendation | null,
): string {
  const parts = [name, contractNumber, type, inputs.startDate, inputs.endDate, String(inputs.contractTermDays)]

  if (type === 'freedom') {
    const freedom = inputs as FreedomInputs
    parts.push(
      String(freedom.cost),
      String(freedom.markup),
      String(freedom.startMileage),
      String(freedom.endMileage),
    )
  } else {
    const gap = inputs as GapInputs
    parts.push(String(gap.fwCost), String(gap.retailCost))
  }

  if (results) {
    const total = primaryTotal(type, results, recommendation ?? undefined)
    if (total != null) parts.push(String(total))
  }

  return parts.filter(Boolean).join(' ').toLowerCase()
}

export function formatRecordSummary(
  name: string,
  type: CaseType,
  inputs: FreedomInputs | GapInputs,
  results: FreedomResults | GapResults,
  recommendation?: FreedomRecommendation,
): string {
  const total = primaryTotal(type, results, recommendation)
  const totalLine = total != null ? `Customer total: $${total.toFixed(2)}` : ''
  return [
    `Record: ${name}`,
    `Type: ${type.toUpperCase()}`,
    `Dates: ${inputs.startDate} → ${inputs.endDate}`,
    totalLine,
  ]
    .filter(Boolean)
    .join('\n')
}