import { NextResponse } from 'next/server'
import { getSession } from '@/lib/api-auth'
import type { FreedomInputs } from '@/lib/calculators/freedom'
import type { GapInputs } from '@/lib/calculators/gap'
import { createCase, ensureSchema, listCasesForUser } from '@/lib/db'
import type { CaseType } from '@/lib/storage'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = new URL(request.url).searchParams.get('type') as CaseType | null
  if (type !== 'freedom' && type !== 'gap') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  await ensureSchema()
  const cases = await listCasesForUser(session.userId, type)
  return NextResponse.json({ cases })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, type, inputs } = body as {
    name: string
    type: CaseType
    inputs: FreedomInputs | GapInputs
  }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Case name is required' }, { status: 400 })
  }
  if (type !== 'freedom' && type !== 'gap') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  await ensureSchema()
  const saved = await createCase(session.userId, name.trim(), type, inputs)
  return NextResponse.json({ case: saved })
}
