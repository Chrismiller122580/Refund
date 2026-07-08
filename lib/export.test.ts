import { describe, expect, it } from 'vitest'
import { calculateFreedom, EXAMPLE_FREEDOM_INPUTS } from './calculators/freedom'
import { getFreedomRecommendation } from './calculators/recommendation'
import { validateFreedomInputs } from './calculators/validation'
import { formatFreedomSummary } from './export'

describe('formatFreedomSummary', () => {
  it('includes key sections and recommendation', () => {
    const results = calculateFreedom(EXAMPLE_FREEDOM_INPUTS)
    const warnings = validateFreedomInputs(EXAMPLE_FREEDOM_INPUTS, results)
    const recommendation = getFreedomRecommendation(results, warnings, EXAMPLE_FREEDOM_INPUTS)
    const text = formatFreedomSummary(
      EXAMPLE_FREEDOM_INPUTS,
      results,
      warnings,
      recommendation,
      'Custom',
    )

    expect(text).toContain('VSC REFUND CALCULATOR SUMMARY')
    expect(text).toContain('Refund per Miles')
    expect(text).toContain('Refund per Days')
    expect(text).toContain('Recommendation:')
  })

  it('omits mileage sections when unlimited mileage is enabled', () => {
    const inputs = { ...EXAMPLE_FREEDOM_INPUTS, unlimitedMileage: true, contractTermMiles: 0 }
    const results = calculateFreedom(inputs)
    const warnings = validateFreedomInputs(inputs, results)
    const recommendation = getFreedomRecommendation(results, warnings, inputs)
    const text = formatFreedomSummary(inputs, results, warnings, recommendation, '36 Months')

    expect(text).toContain('Unlimited Mileage: Yes')
    expect(text).not.toContain('Refund per Miles')
    expect(text).not.toContain('Start Mileage')
    expect(text).toContain('Refund per Days')
  })
})
