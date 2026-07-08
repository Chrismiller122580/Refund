import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import { deleteApiKey, reinstateApiKey, revokeApiKey } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await parseJsonBody<{ action?: string }>(request)
  if (body instanceof Response) return body

  if (body.action === 'reinstate') {
    const reinstated = await reinstateApiKey(id)
    if (!reinstated) {
      return NextResponse.json({ error: 'Not found or not revoked' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const { id } = await params
  const permanent = new URL(request.url).searchParams.get('permanent') === 'true'

  if (permanent) {
    const deleted = await deleteApiKey(id)
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  }

  const revoked = await revokeApiKey(id)
  if (!revoked) return NextResponse.json({ error: 'Not found or already revoked' }, { status: 404 })

  return NextResponse.json({ ok: true })
}