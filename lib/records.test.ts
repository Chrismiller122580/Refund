import { describe, expect, it } from 'vitest'
import { formatCustomerTotal } from './records'
import type { SavedCase } from './storage'

describe('formatCustomerTotal', () => {
  it('returns null when refund total is missing', () => {
    const record: SavedCase = {
      id: '1',
      name: 'FW-1',
      type: 'gap',
      inputs: {
        contractTermDays: 365,
        startDate: '2024-01-01',
        endDate: '2024-06-01',
        fwCost: 100,
        retailCost: 200,
        deductible: 0,
        approvedClaimAmount: 0,
      },
      results: {
        daysUsed: 100,
        prorated: {
          daysPerDiem: 0.1,
          ourPercent: 0.5,
          fwProratedProfit: 10,
          clientProratedProfit: 20,
        },
        refund: {
          amountSentToClient: 0,
          clientRefundToCustomer: 0,
          totalCustomerReceives: null as unknown as number,
        },
      },
      savedAt: '2026-07-08T00:00:00.000Z',
    }

    expect(formatCustomerTotal(record)).toBeNull()
  })
})