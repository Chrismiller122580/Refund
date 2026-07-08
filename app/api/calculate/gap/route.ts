import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import {
  parseGapCalculateRequest,
  parseJsonBody,
  type CalculateRequestBody,
} from '@/lib/api-inputs'
import { persistCalculation } from '@/lib/calculate-persist'
import { calculateGap, type GapInputs } from '@/lib/calculators/gap'
import { validateGapInputs } from '@/lib/calculators/validation'

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  try {
    const raw = await parseJsonBody<CalculateRequestBody<Partial<GapInputs>>>(request)
    if (raw instanceof Response) return raw

    const requireContractNumber = auth.ctx.authMethod === 'api_key'
    const parsed = parseGapCalculateRequest(raw, { requireContractNumber })
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const { contractNumber, inputs } = parsed
    const results = calculateGap(inputs)
    const warnings = validateGapInputs(inputs, results)

    const response: Record<string, unknown> = { results, warnings }

    if (requireContractNumber) {
      const saved = await persistCalculation(auth.ctx, contractNumber, 'gap', inputs)
      response.contractNumber = contractNumber
      response.case = { id: saved.id, savedAt: saved.savedAt, contractNumber: saved.contractNumber }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('GAP calculation error:', error)
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 })
  }
}