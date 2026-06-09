import { describe, expect, it } from 'vitest'
import { calculateFreedom, DEFAULT_FREEDOM_INPUTS } from './freedom'
import { getFreedomRecommendation } from './recommendation'
import { validateFreedomInputs } from './validation'

describe('getFreedomRecommendation', () => {
  it('recommends days path for default Excel data', () => {
    const results = calculateFreedom(DEFAULT_FREEDOM_INPUTS)
    const warnings = validateFreedomInputs(DEFAULT_FREEDOM_INPUTS, results)
    const rec = getFreedomRecommendation(results, warnings)
    expect(rec.recommended).toBe('days')
    expect(rec.milesDisqualified).toBe(true)
  })

  it('recommends miles when miles path wins and is valid', () => {
    const inputs = {
      ...DEFAULT_FREEDOM_INPUTS,
      endMileage: 102000,
      contractTermMiles: 50000,
      contractTermDays: 1095,
    }
    const results = calculateFreedom(inputs)
    const warnings = validateFreedomInputs(inputs, results)
    const rec = getFreedomRecommendation(results, warnings)
    expect(rec.milesDisqualified).toBe(false)
    expect(['miles', 'days', 'equivalent']).toContain(rec.recommended)
  })
})
