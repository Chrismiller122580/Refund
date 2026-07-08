import { describe, expect, it } from 'vitest'
import { getValueAtPath } from './path-resolver'

describe('getValueAtPath', () => {
  it('reads nested values using dot notation', () => {
    const source = {
      vehicle: { startMileage: 12000 },
      dates: { start: '2024-01-01' },
    }

    expect(getValueAtPath(source, 'vehicle.startMileage')).toBe(12000)
    expect(getValueAtPath(source, 'dates.start')).toBe('2024-01-01')
    expect(getValueAtPath(source, 'missing.path')).toBeUndefined()
  })
})