import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import { buildRecordSnapshot } from '@/lib/calculate-snapshot'
import type { FreedomInputs } from '@/lib/calculators/freedom'
import type { GapInputs } from '@/lib/calculators/gap'
import { deleteCaseForUser, findCaseForUser, updateCaseForUser } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  const body = await parseJsonBody<{ name: string; inputs: FreedomInputs | GapInputs }>(request)
  if (body instanceof Response) return body

  const { name, inputs } = body
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Case name is required' }, { status: 400 })
  }
  if (!inputs || typeof inputs !== 'object') {
    return NextResponse.json({ error: 'Case inputs are required' }, { status: 400 })
  }

  const { id } = await params
  const existing = await findCaseForUser(auth.ctx.userId, id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const snapshot = buildRecordSnapshot(existing.type, inputs)
  const updated = await updateCaseForUser(
    auth.ctx.userId,
    id,
    name.trim(),
    inputs,
    snapshot,
  )
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ case: updated })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(_request)
  if ('error' in auth) return auth.error

  const { id } = await params
  const deleted = await deleteCaseForUser(auth.ctx.userId, id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}