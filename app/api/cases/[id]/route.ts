import { NextResponse } from 'next/server'
import { getSession } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import type { FreedomInputs } from '@/lib/calculators/freedom'
import type { GapInputs } from '@/lib/calculators/gap'
import { deleteCaseForUser, updateCaseForUser } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  const updated = await updateCaseForUser(session.userId, id, name.trim(), inputs)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ case: updated })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const deleted = await deleteCaseForUser(session.userId, id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
