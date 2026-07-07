import { NextResponse } from 'next/server'
import type { UserRole } from '@/lib/auth'
import { requireAdmin } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import { hashPassword } from '@/lib/auth'
import { updateUser } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const body = await parseJsonBody<{
    role?: UserRole
    is_active?: boolean
    password?: string
  }>(request)
  if (body instanceof Response) return body

  const { role, is_active, password } = body
  if (role && role !== 'user' && role !== 'admin') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const updates: {
    role?: UserRole
    is_active?: boolean
    passwordHash?: string
  } = {}
  if (role) updates.role = role
  if (typeof is_active === 'boolean') updates.is_active = is_active
  if (password) updates.passwordHash = await hashPassword(password)

  const { id } = await params
  const user = await updateUser(id, updates)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ user })
}