import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

export type UserRole = 'user' | 'admin'

export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
}

function getSecret() {
  const value = process.env.JWT_SECRET
  if (!value) throw new Error('JWT_SECRET is not configured')
  return new TextEncoder().encode(value)
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function signToken(payload: TokenPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: (payload.role as UserRole) ?? 'user',
    }
  } catch {
    return null
  }
}

export const AUTH_COOKIE = 'token'