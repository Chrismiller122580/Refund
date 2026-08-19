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

  it('computes agent chargeback from dealer cost × agent% × unearned portion', () => {
    const inputs = {
      ...EXAMPLE_FREEDOM_INPUTS,
      agentName: 'Jane Agent',
      agentPercent: 10,
    }
    const results = calculateFreedom(inputs)

    expect(results.agentOriginalCommission).toBeCloseTo(192.8, 6) // 1928 × 0.10
    // chargeback = cost × rate × max(0, 1 − ourPercent); clamped so over-term does not create negative chargeback
    const expectedDays =
      results.agentOriginalCommission * Math.max(0, 1 - results.days.ourPercent)
    const expectedMiles =
      results.agentOriginalCommission * Math.max(0, 1 - results.miles.ourPercent)

    expect(results.refundPerDays.agentChargeback).toBeCloseTo(expectedDays, 6)
    expect(results.refundPerMiles.agentChargeback).toBeCloseTo(expectedMiles, 6)
    expect(results.refundPerDays.agentChargeback).toBeGreaterThan(0)
    // Example miles driven far exceeds term → miles path chargeback is 0
    expect(results.refundPerMiles.agentChargeback).toBe(0)
  })
})
