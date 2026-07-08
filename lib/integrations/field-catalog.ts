import type { IntegrationProductType } from './types'

export type FieldValueType = 'number' | 'string' | 'boolean'

export interface CatalogField {
  key: string
  label: string
  type: FieldValueType
  required: boolean
  shared?: boolean
}

const SHARED_FIELDS: CatalogField[] = [
  { key: 'contractTermDays', label: 'Contract term (days)', type: 'number', required: true, shared: true },
  { key: 'startDate', label: 'Start date', type: 'string', required: true, shared: true },
  { key: 'endDate', label: 'End date', type: 'string', required: true, shared: true },
  { key: 'deductible', label: 'Deductible', type: 'number', required: true, shared: true },
  { key: 'approvedClaimAmount', label: 'Approved claim amount', type: 'number', required: true, shared: true },
]

const FREEDOM_ONLY: CatalogField[] = [
  { key: 'startMileage', label: 'Start mileage', type: 'number', required: false },
  { key: 'endMileage', label: 'End mileage', type: 'number', required: false },
  { key: 'contractTermMiles', label: 'Contract term (miles)', type: 'number', required: false },
  { key: 'cost', label: 'FW cost', type: 'number', required: true },
  { key: 'markup', label: 'Markup', type: 'number', required: true },
  { key: 'unlimitedMileage', label: 'Unlimited mileage', type: 'boolean', required: false },
]

const GAP_ONLY: CatalogField[] = [
  { key: 'fwCost', label: 'FW cost', type: 'number', required: true },
  { key: 'retailCost', label: 'Retail cost', type: 'number', required: true },
]

export function getFieldCatalog(productType: IntegrationProductType): CatalogField[] {
  if (productType === 'freedom') {
    return [...SHARED_FIELDS, ...FREEDOM_ONLY]
  }
  return [...SHARED_FIELDS, ...GAP_ONLY]
}

export function getCatalogField(
  productType: IntegrationProductType,
  key: string,
): CatalogField | undefined {
  return getFieldCatalog(productType).find((field) => field.key === key)
}

export function getDefaultMappings(productType: IntegrationProductType): Array<{
  internalField: string
  externalField: string
}> {
  return getFieldCatalog(productType).map((field) => ({
    internalField: field.key,
    externalField: field.key,
  }))
}

export function getMissingRequiredFields(
  productType: IntegrationProductType,
  inputs: Record<string, unknown>,
): string[] {
  const catalog = getFieldCatalog(productType)
  const missing: string[] = []

  for (const field of catalog) {
    if (!field.required) continue
    if (productType === 'freedom' && inputs.unlimitedMileage === true) {
      if (['startMileage', 'endMileage', 'contractTermMiles'].includes(field.key)) {
        continue
      }
    }
    const value = inputs[field.key]
    if (value === undefined || value === null || value === '') {
      missing.push(field.key)
    }
  }

  return missing
}