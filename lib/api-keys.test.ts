import { describe, expect, it } from 'vitest'
import { extractApiKeyFromRequest, generateApiKeyMaterial } from './api-keys'

describe('generateApiKeyMaterial', () => {
  it('creates rfnd_ prefixed keys with stable prefix slice', () => {
    const { key, prefix } = generateApiKeyMaterial()
    expect(key.startsWith('rfnd_')).toBe(true)
    expect(prefix).toBe(key.slice(0, 13))
    expect(key.length).toBeGreaterThan(20)
  })
})

describe('extractApiKeyFromRequest', () => {
  it('reads bearer API keys', () => {
    const request = new Request('https://example.com', {
      headers: { Authorization: 'Bearer rfnd_testkey1234567890' },
    })
    expect(extractApiKeyFromRequest(request)).toBe('rfnd_testkey1234567890')
  })

  it('reads x-api-key header', () => {
    const request = new Request('https://example.com', {
      headers: { 'X-API-Key': 'rfnd_anotherkey123456' },
    })
    expect(extractApiKeyFromRequest(request)).toBe('rfnd_anotherkey123456')
  })
})