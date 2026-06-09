import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_FREEDOM_INPUTS } from './calculators/freedom'
import { deleteCase, listCases, saveCase } from './storage'

const store: Record<string, string> = {}

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
  })
  vi.stubGlobal('crypto', { randomUUID: () => 'test-id-123' })
})

describe('storage', () => {
  it('saves and lists freedom cases', () => {
    saveCase('Test Case', 'freedom', DEFAULT_FREEDOM_INPUTS)
    const cases = listCases('freedom')
    expect(cases).toHaveLength(1)
    expect(cases[0].name).toBe('Test Case')
  })

  it('deletes a saved case', () => {
    saveCase('To Delete', 'freedom', DEFAULT_FREEDOM_INPUTS)
    deleteCase('test-id-123')
    expect(listCases('freedom')).toHaveLength(0)
  })
})
