import { normalizeFreedomInputs, normalizeGapInputs } from '../api-inputs'
import type { FreedomInputs } from '../calculators/freedom'
import type { GapInputs } from '../calculators/gap'
import { getCatalogField, getMissingRequiredFields } from './field-catalog'
import { getValueAtPath } from './path-resolver'
import type { IntegrationProductType, PublicIntegrationFieldMapping } from './types'

function coerceValue(
  value: unknown,
  type: 'number' | 'string' | 'boolean',
): string | number | boolean | undefined {
  if (value === undefined || value === null) return undefined

  if (type === 'boolean') {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (['true', '1', 'yes', 'y'].includes(normalized)) return true
      if (['false', '0', 'no', 'n'].includes(normalized)) return false
    }
    if (typeof value === 'number') return value !== 0
    return undefined
  }

  if (type === 'number') {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    const parsed = Number(String(value).replace(/[$,]/g, ''))
    return Number.isFinite(parsed) ? parsed : undefined
  }

  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return undefined
}

export function mapExternalPayload(
  productType: IntegrationProductType,
  externalPayload: unknown,
  mappings: PublicIntegrationFieldMapping[],
): { raw: Record<string, unknown>; mappedFields: string[] } {
  const raw: Record<string, unknown> = {}
  const mappedFields: string[] = []

  for (const mapping of mappings) {
    if (!mapping.enabled) continue

    const catalogField = getCatalogField(productType, mapping.internalField)
    if (!catalogField) continue

    const externalValue = getValueAtPath(externalPayload, mapping.externalField)
    const coerced = coerceValue(externalValue, catalogField.type)
    if (coerced === undefined) continue

    raw[mapping.internalField] = coerced
    mappedFields.push(mapping.internalField)
  }

  return { raw, mappedFields }
}

export function normalizeMappedInputs(
  productType: IntegrationProductType,
  raw: Record<string, unknown>,
): FreedomInputs | GapInputs {
  if (productType === 'freedom') {
    return normalizeFreedomInputs(raw as Partial<FreedomInputs>)
  }
  return normalizeGapInputs(raw as Partial<GapInputs>)
}

export function buildPullResult(
  productType: IntegrationProductType,
  contractNumber: string,
  externalPayload: unknown,
  mappings: PublicIntegrationFieldMapping[],
  fetchedAt: string,
) {
  const { raw, mappedFields } = mapExternalPayload(productType, externalPayload, mappings)
  const inputs = normalizeMappedInputs(productType, raw)
  const missingRequired = getMissingRequiredFields(
    productType,
    inputs as unknown as Record<string, unknown>,
  )

  return {
    contractNumber,
    type: productType,
    inputs,
    mappedFields,
    missingRequired,
    sourceFetchedAt: fetchedAt,
  }
}