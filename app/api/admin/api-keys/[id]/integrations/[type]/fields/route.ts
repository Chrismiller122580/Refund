import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import { createIntegrationFieldMapping, ensureSchema } from '@/lib/db'
import { requireActiveApiKey } from '@/lib/integrations/admin'
import { getCatalogField } from '@/lib/integrations/field-catalog'
import { parseIntegrationProductType } from '@/lib/integrations/parse-type'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; type: string }> },
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const { id, type } = await params
  const productType = parseIntegrationProductType(type)
  if (!productType) {
    return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 })
  }

  const body = await parseJsonBody<{ internalField?: string; externalField?: string }>(request)
  if (body instanceof Response) return body

  if (!body.internalField || !body.externalField?.trim()) {
    return NextResponse.json(
      { error: 'internalField and externalField are required' },
      { status: 400 },
    )
  }

  const catalogField = getCatalogField(productType, body.internalField)
  if (!catalogField) {
    return NextResponse.json({ error: 'Unknown internal field' }, { status: 400 })
  }

  await ensureSchema()
  const keyResult = await requireActiveApiKey(id)
  if (!keyResult.ok) {
    return NextResponse.json({ error: keyResult.message }, { status: keyResult.status })
  }

  try {
    const mapping = await createIntegrationFieldMapping(
      id,
      productType,
      body.internalField,
      body.externalField,
    )
    return NextResponse.json({ mapping })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create mapping'
    if (message.includes('duplicate key')) {
      return NextResponse.json({ error: 'Mapping already exists for this field' }, { status: 409 })
    }
    throw error
  }
}