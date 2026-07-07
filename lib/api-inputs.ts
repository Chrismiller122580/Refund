import type { FreedomInputs } from './calculators/freedom'
import type { GapInputs } from './calculators/gap'

function num(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function normalizeFreedomInputs(raw: Partial<FreedomInputs>): FreedomInputs {
  return {
    startMileage: num(raw.startMileage),
    endMileage: num(raw.endMileage),
    contractTermMiles: num(raw.contractTermMiles),
    contractTermDays: num(raw.contractTermDays),
    startDate: str(raw.startDate),
    endDate: str(raw.endDate),
    cost: num(raw.cost),
    markup: num(raw.markup),
    deductible: num(raw.deductible),
    approvedClaimAmount: num(raw.approvedClaimAmount),
    unlimitedMileage: raw.unlimitedMileage ?? false,
  }
}

export function normalizeGapInputs(raw: Partial<GapInputs>): GapInputs {
  return {
    contractTermDays: num(raw.contractTermDays),
    startDate: str(raw.startDate),
    endDate: str(raw.endDate),
    fwCost: num(raw.fwCost),
    retailCost: num(raw.retailCost),
    deductible: num(raw.deductible),
    approvedClaimAmount: num(raw.approvedClaimAmount),
  }
}

export async function parseJsonBody<T>(request: Request): Promise<T | Response> {
  try {
    return (await request.json()) as T
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}