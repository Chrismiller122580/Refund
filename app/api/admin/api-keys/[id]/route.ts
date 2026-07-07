import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { revokeApiKey } from '@/lib/db'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const { id } = await params
  const revoked = await revokeApiKey(id)
  if (!revoked) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}