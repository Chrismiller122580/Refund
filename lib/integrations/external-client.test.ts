import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildLookupUrl, ExternalIntegrationError, fetchExternalContract } from './external-client'

describe('buildLookupUrl', () => {
  it('replaces contract number placeholder in template', () => {
    const url = buildLookupUrl(
      'https://api.example.com/',
      '/v1/freedom/contracts/{contractNumber}',
      'FW 123',
    )
    expect(url).toBe('https://api.example.com/v1/freedom/contracts/FW%20123')
  })
})

describe('fetchExternalContract', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws 404 when upstream contract is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: { get: () => 'application/json' },
      }),
    )

    await expect(
      fetchExternalContract(
        'https://api.example.com',
        '/contracts/{contractNumber}',
        '404',
        'none',
        {},
      ),
    ).rejects.toMatchObject({ status: 404, message: 'Contract not found' } satisfies Partial<ExternalIntegrationError>)
  })
})