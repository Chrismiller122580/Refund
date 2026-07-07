import { describe, expect, it } from 'vitest'
import type { SavedCase } from './storage'

describe('SavedCase type', () => {
  it('accepts freedom case shape', () => {
    const c: SavedCase = {
      id: '1',
      name: 'Test',
      type: 'freedom',
      inputs: {
        startMileage: 0,
        endMileage: 0,
        contractTermMiles: 0,
        contractTermDays: 0,
        startDate: '',
        endDate: '',
        cost: 0,
        markup: 0,
        deductible: 0,
        approvedClaimAmount: 0,
        unlimitedMileage: false,
      },
      savedAt: new Date().toISOString(),
    }
    expect(c.type).toBe('freedom')
  })
})
