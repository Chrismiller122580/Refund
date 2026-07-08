import { fetchExternalContract, ExternalIntegrationError } from './external-client'
import { buildPullResult } from './mapper'
import {
  ensureDefaultFieldMappings,
  getIntegrationBundle,
  type IntegrationBundle,
} from '../db'
import type {
  ContractPullResult,
  ContractPullTestResult,
  IntegrationProductType,
} from './types'

export class IntegrationNotConfiguredError extends Error {
  constructor(message = 'Connection not configured') {
    super(message)
    this.name = 'IntegrationNotConfiguredError'
  }
}

function assertBundleReady(bundle: IntegrationBundle | null) {
  const connection = bundle?.connection
  if (!connection) {
    throw new IntegrationNotConfiguredError()
  }
  if (!connection.isActive) {
    throw new IntegrationNotConfiguredError('Integration is inactive')
  }
  if (!connection.baseUrl.trim() || !connection.lookupPathTemplate.trim()) {
    throw new IntegrationNotConfiguredError('Integration URL settings are incomplete')
  }
  return {
    connection,
    mappings: bundle?.mappings ?? [],
  }
}

export async function pullContractByNumber(
  apiKeyId: string,
  productType: IntegrationProductType,
  contractNumber: string,
): Promise<ContractPullResult> {
  await ensureDefaultFieldMappings(apiKeyId, productType)
  const bundle = assertBundleReady(await getIntegrationBundle(apiKeyId, productType))
  const trimmed = contractNumber.trim()
  if (!trimmed) {
    throw new Error('Contract number is required')
  }

  const fetchedAt = new Date().toISOString()
  const externalPayload = await fetchExternalContract(
    bundle.connection.baseUrl,
    bundle.connection.lookupPathTemplate,
    trimmed,
    bundle.connection.authType,
    bundle.connection.authConfig,
  )

  return buildPullResult(
    productType,
    trimmed,
    externalPayload,
    bundle.mappings,
    fetchedAt,
  )
}

export async function testContractPull(
  apiKeyId: string,
  productType: IntegrationProductType,
  contractNumber: string,
): Promise<ContractPullTestResult> {
  await ensureDefaultFieldMappings(apiKeyId, productType)
  const bundle = assertBundleReady(await getIntegrationBundle(apiKeyId, productType))
  const trimmed = contractNumber.trim()
  if (!trimmed) {
    throw new Error('Contract number is required')
  }

  const fetchedAt = new Date().toISOString()
  const externalPayload = await fetchExternalContract(
    bundle.connection.baseUrl,
    bundle.connection.lookupPathTemplate,
    trimmed,
    bundle.connection.authType,
    bundle.connection.authConfig,
  )

  const result = buildPullResult(
    productType,
    trimmed,
    externalPayload,
    bundle.mappings,
    fetchedAt,
  )

  return {
    ...result,
    rawPreview: summarizeRawPreview(externalPayload),
  }
}

function summarizeRawPreview(payload: unknown): unknown {
  const serialized = JSON.stringify(payload)
  if (serialized.length <= 4000) return payload

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const entries = Object.entries(payload as Record<string, unknown>).slice(0, 12)
    return {
      _truncated: true,
      preview: Object.fromEntries(entries),
    }
  }

  return { _truncated: true, preview: serialized.slice(0, 4000) }
}

export function mapIntegrationError(error: unknown) {
  if (error instanceof IntegrationNotConfiguredError) {
    return { status: 503, message: error.message }
  }
  if (error instanceof ExternalIntegrationError) {
    return { status: error.status, message: error.message }
  }
  if (error instanceof Error) {
    return { status: 400, message: error.message }
  }
  return { status: 500, message: 'Integration request failed' }
}