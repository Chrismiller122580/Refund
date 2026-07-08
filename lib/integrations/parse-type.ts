import type { IntegrationProductType } from './types'

export function parseIntegrationProductType(value: string): IntegrationProductType | null {
  if (value === 'freedom' || value === 'gap') return value
  return null
}