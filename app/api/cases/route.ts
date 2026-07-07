import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import type { FreedomInputs } from '@/lib/calculators/freedom'
import type { GapInputs } from '@/lib/calculators/gap'
import { createCase, ensureSchema, listCasesForUser } from '@/lib/db'
import type { CaseType } from '@/lib/storage'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  const type = new URL(request.url).searchParams.get('type') as CaseType | null
  if (type !== 'freedom' && type !== 'gap') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  await ensureSchema()
  const cases = await listCasesForUser(auth.ctx.userId, type)
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
  const saved = await createCase(auth.ctx.userId, name.trim(), type, inputs)
  return NextResponse.json({ case: saved })
}