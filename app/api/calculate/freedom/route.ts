import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import {
  parseFreedomCalculateRequest,
  parseJsonBody,
  type CalculateRequestBody,
} from '@/lib/api-inputs'
import { persistCalculation } from '@/lib/calculate-persist'
import { calculateFreedom, type FreedomInputs } from '@/lib/calculators/freedom'
import { getFreedomRecommendation } from '@/lib/calculators/recommendation'
import { validateFreedomInputs } from '@/lib/calculators/validation'

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  try {
    const raw = await parseJsonBody<CalculateRequestBody<Partial<FreedomInputs>>>(request)
    if (raw instanceof Response) return raw

    const requireContractNumber = auth.ctx.authMethod === 'api_key'
    const parsed = parseFreedomCalculateRequest(raw, { requireContractNumber })
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const { contractNumber, inputs } = parsed
    const results = calculateFreedom(inputs)
    const warnings = validateFreedomInputs(inputs, results)
    const recommendation = getFreedomRecommendation(results, warnings, inputs)

    const response: Record<string, unknown> = { results, warnings, recommendation }

    if (requireContractNumber) {
      const saved = await persistCalculation(auth.ctx, contractNumber, 'freedom', inputs)
      response.contractNumber = contractNumber
      response.case = { id: saved.id, savedAt: saved.savedAt, contractNumber: saved.contractNumber }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Freedom calculation error:', error)
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 })
  }
}