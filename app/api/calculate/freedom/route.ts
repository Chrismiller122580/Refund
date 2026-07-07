import { NextResponse } from 'next/server'
import { normalizeFreedomInputs, parseJsonBody } from '@/lib/api-inputs'
import { calculateFreedom, type FreedomInputs } from '@/lib/calculators/freedom'
import { getFreedomRecommendation } from '@/lib/calculators/recommendation'
import { validateFreedomInputs } from '@/lib/calculators/validation'

export async function POST(request: Request) {
  try {
    const raw = await parseJsonBody<Partial<FreedomInputs>>(request)
    if (raw instanceof Response) return raw

    const inputs = normalizeFreedomInputs(raw)
    const results = calculateFreedom(inputs)
    const warnings = validateFreedomInputs(inputs, results)
    const recommendation = getFreedomRecommendation(results, warnings, inputs)
    return NextResponse.json({ results, warnings, recommendation })
  } catch (error) {
    console.error('Freedom calculation error:', error)
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 })
  }
}