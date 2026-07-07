import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { normalizeGapInputs, parseJsonBody } from '@/lib/api-inputs'
import { calculateGap, type GapInputs } from '@/lib/calculators/gap'
import { validateGapInputs } from '@/lib/calculators/validation'

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  try {
    const raw = await parseJsonBody<Partial<GapInputs>>(request)
    if (raw instanceof Response) return raw

    const inputs = normalizeGapInputs(raw)
    const results = calculateGap(inputs)
    const warnings = validateGapInputs(inputs, results)
    return NextResponse.json({ results, warnings })
  } catch (error) {
    console.error('GAP calculation error:', error)
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 })
  }
}