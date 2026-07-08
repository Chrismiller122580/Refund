import { describe, expect, it } from 'vitest'
import { buildPullResult, mapExternalPayload } from './mapper'
import type { PublicIntegrationFieldMapping } from './types'

const mappings: PublicIntegrationFieldMapping[] = [
  {
    id: '1',
    connectionId: 'c1',
    internalField: 'startDate',
    externalField: 'contract.effectiveDate',
    enabled: true,
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    connectionId: 'c1',
    internalField: 'fwCost',
    externalField: 'pricing.fwCost',
    enabled: true,
    sortOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    connectionId: 'c1',
    internalField: 'retailCost',
    externalField: 'pricing.retailCost',
    enabled: false,
    sortOrder: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

describe('mapExternalPayload', () => {
  it('maps nested external fields and skips disabled mappings', () => {
    const payload = {
      contract: { effectiveDate: '2024-01-15' },
      pricing: { fwCost: '1,250.50', retailCost: 2000 },
    }

    const result = mapExternalPayload('gap', payload, mappings)

    expect(result.mappedFields).toEqual(['startDate', 'fwCost'])
    expect(result.raw.startDate).toBe('2024-01-15')
    expect(result.raw.fwCost).toBe(1250.5)
    expect(result.raw.retailCost).toBeUndefined()
  })
})

describe('buildPullResult', () => {
  it('returns normalized gap inputs and missing required fields', () => {
    const result = buildPullResult(
      'gap',
      'GAP-100',
      {
        contract: { effectiveDate: '2024-01-15' },
        pricing: { fwCost: 1000 },
      },
      mappings,
      '2026-07-08T12:00:00.000Z',
    )

    expect(result.contractNumber).toBe('GAP-100')
    expect(result.inputs.startDate).toBe('2024-01-15')
    expect(result.inputs.fwCost).toBe(1000)
    expect(result.inputs.retailCost).toBe(0)
    expect(result.missingRequired).toContain('endDate')
  })
})