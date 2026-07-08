import type { FreedomInputs } from './calculators/freedom'
import type { GapInputs } from './calculators/gap'

export interface CalculateRequestBody<T> {
  contractNumber?: string
  [key: string]: unknown
}

export type ParsedCalculateRequest<T> =
  | { contractNumber: string; inputs: T }
  | { error: string }

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

function extractContractNumber(raw: CalculateRequestBody<unknown>): string | null {
  const value = raw.contractNumber
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function parseFreedomCalculateRequest(
  raw: CalculateRequestBody<Partial<FreedomInputs>>,
  options: { requireContractNumber: boolean },
): ParsedCalculateRequest<FreedomInputs> {
  const contractNumber = extractContractNumber(raw)
  if (options.requireContractNumber && !contractNumber) {
    return { error: 'contractNumber is required' }
  }

  const { contractNumber: _ignored, ...rest } = raw
  return {
    contractNumber: contractNumber ?? '',
    inputs: normalizeFreedomInputs(rest as Partial<FreedomInputs>),
  }
}

export function parseGapCalculateRequest(
  raw: CalculateRequestBody<Partial<GapInputs>>,
  options: { requireContractNumber: boolean },
): ParsedCalculateRequest<GapInputs> {
  const contractNumber = extractContractNumber(raw)
  if (options.requireContractNumber && !contractNumber) {
    return { error: 'contractNumber is required' }
  }

  const { contractNumber: _ignored, ...rest } = raw
  return {
    contractNumber: contractNumber ?? '',
    inputs: normalizeGapInputs(rest as Partial<GapInputs>),
  }
}

export async function parseJsonBody<T>(request: Request): Promise<T | Response> {
  try {
    return (await request.json()) as T
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}