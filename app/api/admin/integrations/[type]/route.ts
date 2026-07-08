import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import {
  ensureDefaultFieldMappings,
  ensureSchema,
  getIntegrationConnection,
  upsertIntegrationConnection,
} from '@/lib/db'
import { getFieldCatalog } from '@/lib/integrations/field-catalog'
import { parseIntegrationProductType } from '@/lib/integrations/parse-type'
import type { IntegrationAuthType } from '@/lib/integrations/types'

const AUTH_TYPES: IntegrationAuthType[] = ['none', 'bearer', 'api_key_header', 'basic']

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const auth = await requireAdmin(_request)
  if ('error' in auth) return auth.error

  const { type } = await params
  const productType = parseIntegrationProductType(type)
  if (!productType) {
    return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 })
  }

  await ensureSchema()
  const connection = await getIntegrationConnection(productType)
  const mappings = connection
    ? await ensureDefaultFieldMappings(productType)
    : await ensureDefaultFieldMappings(productType)

  return NextResponse.json({
    connection,
    mappings,
    catalog: getFieldCatalog(productType),
  })
}

export async function PUT(
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

  const body = await parseJsonBody<{
    baseUrl?: string
    lookupPathTemplate?: string
    authType?: IntegrationAuthType
    authConfig?: { secretEnvKey?: string; headerName?: string }
    isActive?: boolean
  }>(request)
  if (body instanceof Response) return body

  if (!body.baseUrl?.trim() || !body.lookupPathTemplate?.trim()) {
    return NextResponse.json(
      { error: 'baseUrl and lookupPathTemplate are required' },
      { status: 400 },
    )
  }

  const authType = body.authType ?? 'none'
  if (!AUTH_TYPES.includes(authType)) {
    return NextResponse.json({ error: 'Invalid authType' }, { status: 400 })
  }

  await ensureSchema()
  const connection = await upsertIntegrationConnection(productType, {
    baseUrl: body.baseUrl,
    lookupPathTemplate: body.lookupPathTemplate,
    authType,
    authConfig: body.authConfig ?? {},
    isActive: body.isActive ?? false,
  })

  return NextResponse.json({ connection })
}