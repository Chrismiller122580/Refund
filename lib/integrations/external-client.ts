import type { IntegrationAuthConfig, IntegrationAuthType } from './types'

export class ExternalIntegrationError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ExternalIntegrationError'
    this.status = status
  }
}

function resolveAuthSecret(authConfig: IntegrationAuthConfig): string | undefined {
  if (!authConfig.secretEnvKey) return undefined
  return process.env[authConfig.secretEnvKey]
}

function buildAuthHeaders(
  authType: IntegrationAuthType,
  authConfig: IntegrationAuthConfig,
): HeadersInit {
  const secret = resolveAuthSecret(authConfig)
  if (!secret || authType === 'none') return {}

  if (authType === 'bearer') {
    return { Authorization: `Bearer ${secret}` }
  }

  if (authType === 'api_key_header') {
    const headerName = authConfig.headerName?.trim() || 'X-API-Key'
    return { [headerName]: secret }
  }

  if (authType === 'basic') {
    return { Authorization: `Basic ${Buffer.from(secret).toString('base64')}` }
  }

  return {}
}

export function buildLookupUrl(
  baseUrl: string,
  lookupPathTemplate: string,
  contractNumber: string,
): string {
  const trimmedBase = baseUrl.replace(/\/+$/, '')
  const path = lookupPathTemplate.includes('{contractNumber}')
    ? lookupPathTemplate.replace('{contractNumber}', encodeURIComponent(contractNumber))
    : `${lookupPathTemplate.replace(/\/+$/, '')}/${encodeURIComponent(contractNumber)}`

  return `${trimmedBase}${path.startsWith('/') ? path : `/${path}`}`
}

export async function fetchExternalContract(
  baseUrl: string,
  lookupPathTemplate: string,
  contractNumber: string,
  authType: IntegrationAuthType,
  authConfig: IntegrationAuthConfig,
): Promise<unknown> {
  const url = buildLookupUrl(baseUrl, lookupPathTemplate, contractNumber)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...buildAuthHeaders(authType, authConfig),
      },
      cache: 'no-store',
      signal: controller.signal,
    })

    if (response.status === 404) {
      throw new ExternalIntegrationError('Contract not found', 404)
    }

    if (!response.ok) {
      throw new ExternalIntegrationError('Upstream fetch failed', 502)
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      throw new ExternalIntegrationError('Upstream returned non-JSON response', 502)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ExternalIntegrationError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ExternalIntegrationError('Upstream fetch timed out', 502)
    }
    throw new ExternalIntegrationError('Upstream fetch failed', 502)
  } finally {
    clearTimeout(timeout)
  }
}