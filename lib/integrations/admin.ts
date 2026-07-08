import { findApiKeyById, type PublicApiKey } from '../db'

type ApiKeyLookupResult =
  | { ok: true; apiKey: PublicApiKey }
  | { ok: false; status: number; message: string }

export async function requireActiveApiKey(apiKeyId: string): Promise<ApiKeyLookupResult> {
  const apiKey = await findApiKeyById(apiKeyId)
  if (!apiKey) {
    return { ok: false, status: 404, message: 'API key not found' }
  }
  if (apiKey.revokedAt) {
    return { ok: false, status: 400, message: 'Cannot configure a revoked API key' }
  }
  return { ok: true, apiKey }
}