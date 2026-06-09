import { NextResponse } from 'next/server'
import { calculateGap, type GapInputs } from '@/lib/calculators/gap'
import { validateGapInputs } from '@/lib/calculators/validation'

export async function POST(request: Request) {
  const inputs = (await request.json()) as GapInputs
  const results = calculateGap(inputs)
  const warnings = validateGapInputs(inputs, results)
  return NextResponse.json({ results, warnings })
}
