import { describe, expect, it } from 'vitest'
import { calculateFreedom, DEFAULT_FREEDOM_INPUTS } from './calculators/freedom'
import { getFreedomRecommendation } from './calculators/recommendation'
import { validateFreedomInputs } from './calculators/validation'
import { formatFreedomSummary } from './export'

describe('formatFreedomSummary', () => {
  it('includes key sections and recommendation', () => {
    const results = calculateFreedom(DEFAULT_FREEDOM_INPUTS)
    const warnings = validateFreedomInputs(DEFAULT_FREEDOM_INPUTS, results)
    const recommendation = getFreedomRecommendation(results, warnings)
    const text = formatFreedomSummary(
      DEFAULT_FREEDOM_INPUTS,
      results,
      warnings,
      recommendation,
      'Custom',
    )

    expect(text).toContain('FREEDOM REFUND CALCULATOR SUMMARY')
    expect(text).toContain('Refund per Miles')
    expect(text).toContain('Refund per Days')
    expect(text).toContain('Recommendation:')
  })
})
