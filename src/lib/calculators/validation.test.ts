import { describe, expect, it } from 'vitest'
import { calculateFreedom, DEFAULT_FREEDOM_INPUTS } from './freedom'
import { calculateGap, DEFAULT_GAP_INPUTS } from './gap'
import { validateFreedomInputs, validateGapInputs } from './validation'

describe('validateFreedomInputs', () => {
  it('returns no errors for valid default inputs', () => {
    const results = calculateFreedom(DEFAULT_FREEDOM_INPUTS)
    const warnings = validateFreedomInputs(DEFAULT_FREEDOM_INPUTS, results)
    const errors = warnings.filter((w) => w.severity === 'error')
    expect(errors).toHaveLength(0)
  })

  it('warns when mile cap is exceeded', () => {
    const inputs = { ...DEFAULT_FREEDOM_INPUTS, endMileage: 999999 }
    const results = calculateFreedom(inputs)
    const warnings = validateFreedomInputs(inputs, results)
    expect(warnings.some((w) => w.id === 'mile-cap-exceeded')).toBe(true)
  })

  it('errors when end date is before start date', () => {
    const inputs = {
      ...DEFAULT_FREEDOM_INPUTS,
      startDate: '2025-01-01',
      endDate: '2024-01-01',
    }
    const results = calculateFreedom(inputs)
    const warnings = validateFreedomInputs(inputs, results)
    expect(warnings.some((w) => w.id === 'invalid-date-range')).toBe(true)
  })

  it('errors when end mileage is below start mileage', () => {
    const inputs = { ...DEFAULT_FREEDOM_INPUTS, endMileage: 50000 }
    const results = calculateFreedom(inputs)
    const warnings = validateFreedomInputs(inputs, results)
    expect(warnings.some((w) => w.id === 'negative-miles-driven')).toBe(true)
  })

  it('warns on negative refund per miles with default data', () => {
    const results = calculateFreedom(DEFAULT_FREEDOM_INPUTS)
    const warnings = validateFreedomInputs(DEFAULT_FREEDOM_INPUTS, results)
    expect(warnings.some((w) => w.id === 'negative-refund-miles')).toBe(true)
  })
})

describe('validateGapInputs', () => {
  it('returns no errors for valid default inputs', () => {
    const results = calculateGap(DEFAULT_GAP_INPUTS)
    const warnings = validateGapInputs(DEFAULT_GAP_INPUTS, results)
    const errors = warnings.filter((w) => w.severity === 'error')
    expect(errors).toHaveLength(0)
  })

  it('errors when end date is before start date', () => {
    const inputs = {
      ...DEFAULT_GAP_INPUTS,
      startDate: '2025-01-01',
      endDate: '2024-01-01',
    }
    const results = calculateGap(inputs)
    const warnings = validateGapInputs(inputs, results)
    expect(warnings.some((w) => w.id === 'invalid-date-range')).toBe(true)
  })

  it('errors when contract term days is zero', () => {
    const inputs = { ...DEFAULT_GAP_INPUTS, contractTermDays: 0 }
    const results = calculateGap(inputs)
    const warnings = validateGapInputs(inputs, results)
    expect(warnings.some((w) => w.id === 'invalid-contract-term-days')).toBe(true)
  })

  it('info when retail cost is below fw cost', () => {
    const inputs = { ...DEFAULT_GAP_INPUTS, fwCost: 500, retailCost: 100 }
    const results = calculateGap(inputs)
    const warnings = validateGapInputs(inputs, results)
    expect(warnings.some((w) => w.id === 'retail-below-fw-cost')).toBe(true)
  })
})
