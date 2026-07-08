import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import { parseIntegrationProductType } from '@/lib/integrations/parse-type'
import { mapIntegrationError, testContractPull } from '@/lib/integrations/service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const { type } = await params
  const productType = parseIntegrationProductType(type)
  if (!productType) {
    return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 })
  }

  const body = await parseJsonBody<{ contractNumber?: string }>(request)
  if (body instanceof Response) return body

  if (!body.contractNumber?.trim()) {
    return NextResponse.json({ error: 'contractNumber is required' }, { status: 400 })
  }

  try {
    const result = await testContractPull(productType, body.contractNumber)
    return NextResponse.json(result)
  } catch (error) {
    const mapped = mapIntegrationError(error)
    return NextResponse.json({ error: mapped.message }, { status: mapped.status })
  }
}