import type { FreedomInputs } from '../calculators/freedom'
import type { GapInputs } from '../calculators/gap'

export type IntegrationProductType = 'freedom' | 'gap'

export type IntegrationAuthType = 'none' | 'bearer' | 'api_key_header' | 'basic'

export interface IntegrationAuthConfig {
  secretEnvKey?: string
  headerName?: string
}

export interface DbIntegrationConnection {
  id: string
  api_key_id: string
  product_type: IntegrationProductType
  base_url: string
  lookup_path_template: string
  auth_type: IntegrationAuthType
  auth_config: IntegrationAuthConfig
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PublicIntegrationConnection {
  id: string
  apiKeyId: string
  productType: IntegrationProductType
  baseUrl: string
  lookupPathTemplate: string
  authType: IntegrationAuthType
  authConfig: IntegrationAuthConfig
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DbIntegrationFieldMapping {
  id: string
  connection_id: string
  internal_field: string
  external_field: string
  enabled: boolean
  sort_order: number
  created_at: string
}

export interface PublicIntegrationFieldMapping {
  id: string
  connectionId: string
  internalField: string
  externalField: string
  enabled: boolean
  sortOrder: number
  createdAt: string
}

export interface ContractPullResult {
  contractNumber: string
  type: IntegrationProductType
  inputs: FreedomInputs | GapInputs
  mappedFields: string[]
  missingRequired: string[]
  sourceFetchedAt: string
}

export interface ContractPullTestResult extends ContractPullResult {
  rawPreview?: unknown
}