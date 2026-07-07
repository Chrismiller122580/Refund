import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { extractApiKeyFromRequest, verifyApiKey } from './api-keys'
import { verifyToken, type UserRole } from './auth'
import { findUserById } from './db'

export type AuthMethod = 'cookie' | 'api_key'

export interface AuthContext {
  userId: string
  email: string
  role: UserRole
  authMethod: AuthMethod
}

export async function getAuthContext(request: Request): Promise<AuthContext | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (token) {
    const payload = await verifyToken(token)
    if (payload) {
      const user = await findUserById(payload.userId)
      if (user?.is_active) {
        return {
          userId: user.id,
          email: user.email,
          role: user.role ?? payload.role ?? 'user',
          authMethod: 'cookie',
        }
      }
    }
  }

  const apiKey = extractApiKeyFromRequest(request)
  if (apiKey) {
    const record = await verifyApiKey(apiKey)
    if (record) {
      const user = await findUserById(record.user_id)
      if (user?.is_active) {
        return {
          userId: user.id,
          email: user.email,
          role: user.role ?? 'user',
          authMethod: 'api_key',
        }
      }
    }
  }

  return null
}

export async function requireAuth(
  request: Request,
): Promise<{ ctx: AuthContext } | { error: NextResponse }> {
  const ctx = await getAuthContext(request)
  if (!ctx) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { ctx }
}

export async function requireAdmin(
  request: Request,
): Promise<{ ctx: AuthContext } | { error: NextResponse }> {
  const result = await requireAuth(request)
  if ('error' in result) return result
  if (result.ctx.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return result
}

/** @deprecated Use getAuthContext(request) */
export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}