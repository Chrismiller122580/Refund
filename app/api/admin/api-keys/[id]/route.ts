import { NextResponse } from 'next/server'
import { requireAdminOrIntegrator } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import { deleteApiKey, ensureSchema, findApiKeyById, reinstateApiKey, revokeApiKey } from '@/lib/db'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminOrIntegrator(request)
  if ('error' in auth) return auth.error

  const { id } = await params
  await ensureSchema()
  const permanent = new URL(request.url).searchParams.get('permanent') === 'true'

  try {
    if (permanent) {
      const deleted = await deleteApiKey(id)
      if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ deleted: true })
    }
    const revoked = await revokeApiKey(id)
    if (!revoked) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ revoked: true })
  } catch (error) {
    console.error('API key delete error:', error)
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminOrIntegrator(request)
  if ('error' in auth) return auth.error

  const body = await parseJsonBody<{ action?: string }>(request)
  if (body instanceof Response) return body

  const { id } = await params
  await ensureSchema()

  if (body.action === 'reinstate') {
    const reinstated = await reinstateApiKey(id)
    if (!reinstated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ reinstated: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminOrIntegrator(request)
  if ('error' in auth) return auth.error

  const { id } = await params
  await ensureSchema()
  const key = await findApiKeyById(id)
  if (!key) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ apiKey: key })
}
