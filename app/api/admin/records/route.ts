import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { ensureSchema, listAllRecords } from '@/lib/db'
import type { CaseType } from '@/lib/storage'

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const typeParam = url.searchParams.get('type')
  const q = url.searchParams.get('q') ?? undefined
  const limitParam = url.searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : undefined

  const type =
    typeParam === 'freedom' || typeParam === 'gap' ? (typeParam as CaseType) : undefined

  await ensureSchema()
  const records = await listAllRecords({ type, q, limit })
  return NextResponse.json({ records })
}