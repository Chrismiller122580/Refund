import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { calculateFreedom, type FreedomInputs } from '@/lib/calculators/freedom'
import { calculateGap, type GapInputs } from '@/lib/calculators/gap'
import { getFreedomRecommendation } from '@/lib/calculators/recommendation'
import { validateFreedomInputs, validateGapInputs } from '@/lib/calculators/validation'
import { parseIntegrationProductType } from '@/lib/integrations/parse-type'
import { mapIntegrationError, pullContractByNumber } from '@/lib/integrations/service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string; contractNumber: string }> },
) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  const { type, contractNumber } = await params
  const productType = parseIntegrationProductType(type)
  if (!productType) {
    return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 })
  }

  try {
    const pull = await pullContractByNumber(productType, decodeURIComponent(contractNumber))
    if (pull.missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: 'Mapped contract is missing required fields',
          missingRequired: pull.missingRequired,
          pull,
        },
        { status: 400 },
      )
    }

    if (productType === 'freedom') {
      const inputs = pull.inputs as FreedomInputs
      const results = calculateFreedom(inputs)
      const warnings = validateFreedomInputs(inputs, results)
      const recommendation = getFreedomRecommendation(results, warnings, inputs)
      return NextResponse.json({ pull, results, warnings, recommendation })
    }

    const inputs = pull.inputs as GapInputs
    const results = calculateGap(inputs)
    const warnings = validateGapInputs(inputs, results)
    return NextResponse.json({ pull, results, warnings })
  } catch (error) {
    const mapped = mapIntegrationError(error)
    return NextResponse.json({ error: mapped.message }, { status: mapped.status })
  }
}