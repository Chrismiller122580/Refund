import { describe, expect, it } from 'vitest'
import { calculateGap, EXAMPLE_GAP_INPUTS } from './gap'

describe('calculateGap', () => {
  it('computes proration and refund from example workbook inputs', () => {
    const results = calculateGap(EXAMPLE_GAP_INPUTS)

    expect(results.daysUsed).toBe(1091)
    expect(results.prorated.daysPerDiem).toBeCloseTo(0.056438356164383564, 10)
    expect(results.prorated.ourPercent).toBeCloseTo(0.5978082191780822, 10)
    expect(results.prorated.fwProratedProfit).toBeCloseTo(61.57424657534247, 8)
    expect(results.prorated.clientProratedProfit).toBeCloseTo(511.1260273972603, 8)
    expect(results.refund.amountSentToClient).toBeCloseTo(-8.574246575342471, 8)
    expect(results.refund.clientRefundToCustomer).toBeCloseTo(343.8739726027397, 8)
    expect(results.refund.totalCustomerReceives).toBeCloseTo(335.29972602739724, 8)
  })

  it('derives total customer receives from client and dealer amounts', () => {
    const results = calculateGap(EXAMPLE_GAP_INPUTS)

    expect(results.refund.totalCustomerReceives).toBeCloseTo(
      results.refund.amountSentToClient + results.refund.clientRefundToCustomer,
      10,
    )
    expect(Number.isFinite(results.refund.totalCustomerReceives)).toBe(true)
  })

  it('applies deductible and approved claim against amount sent to client', () => {
    const baselineInputs = { ...EXAMPLE_GAP_INPUTS, deductible: 0, approvedClaimAmount: 0 }
    const withDeductions = calculateGap({
      ...baselineInputs,
      deductible: 100,
      approvedClaimAmount: 25,
    })
    const baseline = calculateGap(baselineInputs)

    expect(withDeductions.refund.amountSentToClient).toBeCloseTo(
      baseline.refund.amountSentToClient - 125,
      8,
    )
    expect(withDeductions.refund.clientRefundToCustomer).toBe(
      baseline.refund.clientRefundToCustomer,
    )
  })
})