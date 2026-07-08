import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import {
  deleteIntegrationFieldMapping,
  ensureSchema,
  updateIntegrationFieldMapping,
} from '@/lib/db'
import { parseIntegrationProductType } from '@/lib/integrations/parse-type'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const { type, id } = await params
  const productType = parseIntegrationProductType(type)
  if (!productType) {
    return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 })
  }

  const body = await parseJsonBody<{ externalField?: string; enabled?: boolean }>(request)
  if (body instanceof Response) return body

  await ensureSchema()
  const mapping = await updateIntegrationFieldMapping(productType, id, body)
  if (!mapping) {
    return NextResponse.json({ error: 'Mapping not found' }, { status: 404 })
  }

  return NextResponse.json({ mapping })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const { type, id } = await params
  const productType = parseIntegrationProductType(type)
  if (!productType) {
    return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 })
  }

  await ensureSchema()
  const deleted = await deleteIntegrationFieldMapping(productType, id)
  if (!deleted) {
    return NextResponse.json({ error: 'Mapping not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}