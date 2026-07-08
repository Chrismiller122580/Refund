import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { parseIntegrationProductType } from '@/lib/integrations/parse-type'
import { mapIntegrationError, pullContractByNumber } from '@/lib/integrations/service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; contractNumber: string }> },
) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  if (auth.ctx.authMethod !== 'api_key' || !auth.ctx.apiKeyId) {
    return NextResponse.json(
      { error: 'Contract pull requires API key authentication' },
      { status: 403 },
    )
  }

  const { type, contractNumber } = await params
  const productType = parseIntegrationProductType(type)
  if (!productType) {
    return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 })
  }

  try {
    const result = await pullContractByNumber(
      auth.ctx.apiKeyId,
      productType,
      decodeURIComponent(contractNumber),
    )
    return NextResponse.json(result)
  } catch (error) {
    const mapped = mapIntegrationError(error)
    return NextResponse.json({ error: mapped.message }, { status: mapped.status })
  }
}