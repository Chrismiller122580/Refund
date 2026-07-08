import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import {
  deleteIntegrationFieldMapping,
  ensureSchema,
  updateIntegrationFieldMapping,
} from '@/lib/db'
import { requireActiveApiKey } from '@/lib/integrations/admin'
import { parseIntegrationProductType } from '@/lib/integrations/parse-type'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; type: string; fieldId: string }> },
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const { id, type, fieldId } = await params
  const productType = parseIntegrationProductType(type)
  if (!productType) {
    return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 })
  }

  const body = await parseJsonBody<{ externalField?: string; enabled?: boolean }>(request)
  if (body instanceof Response) return body

  await ensureSchema()
  const keyResult = await requireActiveApiKey(id)
  if (!keyResult.ok) {
    return NextResponse.json({ error: keyResult.message }, { status: keyResult.status })
  }

  const mapping = await updateIntegrationFieldMapping(id, productType, fieldId, body)
  if (!mapping) {
    return NextResponse.json({ error: 'Mapping not found' }, { status: 404 })
  }

  return NextResponse.json({ mapping })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; type: string; fieldId: string }> },
) {
  const auth = await requireAdmin(_request)
  if ('error' in auth) return auth.error

  const { id, type, fieldId } = await params
  const productType = parseIntegrationProductType(type)
  if (!productType) {
    return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 })
  }

  await ensureSchema()
  const keyResult = await requireActiveApiKey(id)
  if (!keyResult.ok) {
    return NextResponse.json({ error: keyResult.message }, { status: keyResult.status })
  }

  const deleted = await deleteIntegrationFieldMapping(id, productType, fieldId)
  if (!deleted) {
    return NextResponse.json({ error: 'Mapping not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}