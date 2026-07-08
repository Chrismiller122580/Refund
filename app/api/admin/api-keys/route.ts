import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { generateApiKeyMaterial, hashApiKey } from '@/lib/api-keys'
import { parseJsonBody } from '@/lib/api-inputs'
import { createApiKeyRecord, ensureSchema, findUserById, listApiKeys } from '@/lib/db'
import { sendApiKeyCreatedEmail } from '@/lib/email'

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  await ensureSchema()
  const apiKeys = await listApiKeys()
  return NextResponse.json({ apiKeys })
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const body = await parseJsonBody<{ userId: string; name: string }>(request)
  if (body instanceof Response) return body

  const { userId, name } = body
  if (!userId || !name?.trim()) {
    return NextResponse.json({ error: 'userId and name are required' }, { status: 400 })
  }

  await ensureSchema()
  const user = await findUserById(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { key, prefix } = generateApiKeyMaterial()
  const keyHash = await hashApiKey(key)
  const record = await createApiKeyRecord(userId, name.trim(), prefix, keyHash)

  const emailSent = await sendApiKeyCreatedEmail({
    to: user.email,
    keyName: record.name,
    key,
    keyPrefix: record.key_prefix,
    createdByEmail: auth.ctx.email,
  })

  return NextResponse.json({
    apiKey: {
      id: record.id,
      userId: record.user_id,
      name: record.name,
      keyPrefix: record.key_prefix,
      createdAt: record.created_at,
      key,
    },
    emailSent,
    emailedTo: user.email,
  })
}