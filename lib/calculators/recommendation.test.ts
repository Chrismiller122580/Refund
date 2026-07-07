import { describe, expect, it } from 'vitest'
import { calculateFreedom, EXAMPLE_FREEDOM_INPUTS } from './freedom'
import { getFreedomRecommendation } from './recommendation'
import { validateFreedomInputs } from './validation'

describe('getFreedomRecommendation', () => {
  it('recommends days path for default Excel data', () => {
    const results = calculateFreedom(EXAMPLE_FREEDOM_INPUTS)
    const warnings = validateFreedomInputs(EXAMPLE_FREEDOM_INPUTS, results)
    const rec = getFreedomRecommendation(results, warnings, EXAMPLE_FREEDOM_INPUTS)
    expect(rec.recommended).toBe('days')
    expect(rec.milesDisqualified).toBe(true)
  })

  it('recommends days for unlimited mileage products', () => {
    const inputs = { ...EXAMPLE_FREEDOM_INPUTS, unlimitedMileage: true, contractTermMiles: 0 }
    const results = calculateFreedom(inputs)
    const warnings = validateFreedomInputs(inputs, results)
    const rec = getFreedomRecommendation(results, warnings, inputs)
    expect(rec.recommended).toBe('days')
    expect(rec.milesDisqualified).toBe(true)
    expect(rec.milesDisqualifyReason).toContain('Unlimited mileage')
  })

  it('recommends miles when miles path wins and is valid', () => {
    const inputs = {
      ...EXAMPLE_FREEDOM_INPUTS,
      endMileage: 102000,
      contractTermMiles: 50000,
      contractTermDays: 1095,
    }
    const results = calculateFreedom(inputs)
    const warnings = validateFreedomInputs(inputs, results)
    const rec = getFreedomRecommendation(results, warnings, inputs)
    expect(rec.milesDisqualified).toBe(false)
    expect(['miles', 'days', 'equivalent']).toContain(rec.recommended)
  })
})
