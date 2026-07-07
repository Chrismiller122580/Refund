import { describe, expect, it } from 'vitest'
import { calculateFreedom, EXAMPLE_FREEDOM_INPUTS } from './freedom'

describe('calculateFreedom', () => {
  it('returns valid days refund when unlimited mileage is enabled', () => {
    const inputs = {
      ...EXAMPLE_FREEDOM_INPUTS,
      contractTermMiles: 0,
      unlimitedMileage: true,
    }
    const results = calculateFreedom(inputs)

    expect(results.daysUsed).toBeGreaterThan(0)
    expect(results.refundPerDays.totalCustomerReceives).toBeGreaterThan(0)
    expect(results.refundPerMiles.totalCustomerReceives).toBe(0)
    expect(results.mileCap).toBe(0)
    expect(results.milesDriven).toBe(0)
    expect(Number.isFinite(results.refundPerDays.totalCustomerReceives)).toBe(true)
    expect(Number.isNaN(results.days.ourPercent)).toBe(false)
  })

  it('computes both paths when unlimited mileage is disabled', () => {
    const results = calculateFreedom(EXAMPLE_FREEDOM_INPUTS)

    expect(results.mileCap).toBeGreaterThan(0)
    expect(results.milesDriven).toBeGreaterThan(0)
    expect(results.refundPerMiles.totalCustomerReceives).not.toBe(0)
  })
})