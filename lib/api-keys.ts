import { randomBytes } from 'crypto'
import { hashPassword, verifyPassword } from './auth'
import { findActiveApiKeysByPrefix, touchApiKeyLastUsed } from './db'

const KEY_PREFIX = 'rfnd_'

export function generateApiKeyMaterial() {
  const secret = randomBytes(24).toString('base64url')
  const key = `${KEY_PREFIX}${secret}`
  const prefix = key.slice(0, 13)
  return { key, prefix }
}

export async function hashApiKey(key: string) {
  return hashPassword(key)
}

export async function verifyApiKey(key: string) {
  if (!key.startsWith(KEY_PREFIX) || key.length < 20) return null

  const prefix = key.slice(0, 13)
  const candidates = await findActiveApiKeysByPrefix(prefix)

  for (const candidate of candidates) {
    if (await verifyPassword(key, candidate.key_hash)) {
      await touchApiKeyLastUsed(candidate.id)
      return candidate
    }
  }

  return null
}

export function extractApiKeyFromRequest(request: Request): string | null {
  const authorization = request.headers.get('authorization')
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    const token = authorization.slice(7).trim()
    if (token.startsWith(KEY_PREFIX)) return token
  }

  const headerKey = request.headers.get('x-api-key')?.trim()
  if (headerKey?.startsWith(KEY_PREFIX)) return headerKey

  return null
}