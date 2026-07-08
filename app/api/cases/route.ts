import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import { buildRecordSnapshot } from '@/lib/calculate-snapshot'
import type { FreedomInputs } from '@/lib/calculators/freedom'
import type { GapInputs } from '@/lib/calculators/gap'
import { createCase, ensureSchema, listCasesForUser } from '@/lib/db'
import { getRecordNotificationRecipients, sendRecordCreatedEmail } from '@/lib/email'
import type { CaseType } from '@/lib/storage'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const typeParam = url.searchParams.get('type')
  const q = url.searchParams.get('q') ?? undefined
  const limitParam = url.searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : undefined

  const type =
    typeParam === 'freedom' || typeParam === 'gap' ? (typeParam as CaseType) : undefined

  await ensureSchema()
  const cases = await listCasesForUser(auth.ctx.userId, { type, q, limit })
  return NextResponse.json({ cases })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  const body = await parseJsonBody<{
    name: string
    type: CaseType
    inputs: FreedomInputs | GapInputs
  }>(request)
  if (body instanceof Response) return body

  const { name, type, inputs } = body
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Case name is required' }, { status: 400 })
  }
  if (type !== 'freedom' && type !== 'gap') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  await ensureSchema()
  const snapshot = buildRecordSnapshot(type, inputs)
  const saved = await createCase(auth.ctx.userId, name.trim(), type, inputs, snapshot)

  void sendRecordCreatedEmail({
    to: getRecordNotificationRecipients(auth.ctx.email),
    createdByEmail: auth.ctx.email,
    name: saved.name,
    type: saved.type,
    inputs: saved.inputs,
    results: snapshot.results,
    recommendation: snapshot.recommendation,
    recordId: saved.id,
  }).catch((error) => console.error('Record email error:', error))

  return NextResponse.json({ case: saved })
}