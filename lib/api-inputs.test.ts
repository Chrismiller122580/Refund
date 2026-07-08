import { describe, expect, it } from 'vitest'
import type { GapInputs } from './calculators/gap'
import {
  normalizeFreedomInputs,
  normalizeGapInputs,
  parseFreedomCalculateRequest,
  parseGapCalculateRequest,
} from './api-inputs'

describe('normalizeFreedomInputs', () => {
  it('defaults unlimitedMileage to false when omitted', () => {
    const inputs = normalizeFreedomInputs({
      startMileage: 100,
      endMileage: 200,
      contractTermMiles: 5000,
      contractTermDays: 1095,
      startDate: '2024-01-01',
      endDate: '2024-06-01',
      cost: 1000,
      markup: 500,
      deductible: 0,
      approvedClaimAmount: 0,
    })
    expect(inputs.unlimitedMileage).toBe(false)
  })

  it('preserves unlimitedMileage when true', () => {
    const inputs = normalizeFreedomInputs({ unlimitedMileage: true })
    expect(inputs.unlimitedMileage).toBe(true)
  })
})

describe('parseFreedomCalculateRequest', () => {
  it('requires contractNumber when configured', () => {
    const result = parseFreedomCalculateRequest({ startMileage: 100 }, { requireContractNumber: true })
    expect(result).toEqual({ error: 'contractNumber is required' })
  })

  it('extracts contractNumber and normalizes inputs', () => {
    const result = parseFreedomCalculateRequest(
      { contractNumber: ' FW-1 ', startMileage: 100, endMileage: 200 },
      { requireContractNumber: true },
    )
    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.contractNumber).toBe('FW-1')
    expect(result.inputs.startMileage).toBe(100)
  })
})

describe('parseGapCalculateRequest', () => {
  it('requires contractNumber when configured', () => {
    const result = parseGapCalculateRequest({ fwCost: 100 }, { requireContractNumber: true })
    expect(result).toEqual({ error: 'contractNumber is required' })
  })
})

describe('normalizeGapInputs', () => {
  it('coerces numeric fields and defaults missing values', () => {
    const inputs = normalizeGapInputs({
      contractTermDays: '1825',
      fwCost: 500,
      retailCost: 1000,
    } as unknown as Partial<GapInputs>)

    expect(inputs.contractTermDays).toBe(1825)
    expect(inputs.startDate).toBe('')
    expect(inputs.deductible).toBe(0)
  })
})