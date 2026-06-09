import { NextResponse } from 'next/server'
import { calculateFreedom, type FreedomInputs } from '@/lib/calculators/freedom'
import { getFreedomRecommendation } from '@/lib/calculators/recommendation'
import { validateFreedomInputs } from '@/lib/calculators/validation'

export async function POST(request: Request) {
  const inputs = (await request.json()) as FreedomInputs
  const results = calculateFreedom(inputs)
  const warnings = validateFreedomInputs(inputs, results)
  const recommendation = getFreedomRecommendation(results, warnings)
  return NextResponse.json({ results, warnings, recommendation })
}
