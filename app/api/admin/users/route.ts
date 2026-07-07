import { NextResponse } from 'next/server'
import type { UserRole } from '@/lib/auth'
import { requireAdmin } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import { hashPassword } from '@/lib/auth'
import { createUser, ensureSchema, listUsers } from '@/lib/db'

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  await ensureSchema()
  const users = await listUsers()
  return NextResponse.json({ users })
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const body = await parseJsonBody<{
    email: string
    password: string
    role?: UserRole
  }>(request)
  if (body instanceof Response) return body

  const { email, password, role = 'user' } = body
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  if (role !== 'user' && role !== 'admin') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  await ensureSchema()
  try {
    const passwordHash = await hashPassword(password)
    const user = await createUser(email.trim(), passwordHash, role)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}