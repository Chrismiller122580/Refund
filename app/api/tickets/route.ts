import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import { canManageTickets } from '@/lib/auth'
import { ensureSchema } from '@/lib/db'
import {
  createTicket,
  listTickets,
  parseCategory,
  parsePriority,
  parseStatus,
} from '@/lib/tickets'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  await ensureSchema()
  const url = new URL(request.url)
  const status = parseStatus(url.searchParams.get('status'))
  const staff = canManageTickets(auth.ctx.role)
  const tickets = await listTickets({
    createdBy: staff ? undefined : auth.ctx.userId,
    status: status ?? undefined,
  })
  return NextResponse.json({ tickets, canManage: staff })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  const body = await parseJsonBody<{
    title?: string
    body?: string
    category?: string
    priority?: string
  }>(request)
  if (body instanceof Response) return body

  const title = body.title?.trim()
  const details = body.body?.trim() ?? ''
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const category = parseCategory(body.category) ?? 'other'
  const priority = parsePriority(body.priority) ?? 'normal'

  await ensureSchema()
  const ticket = await createTicket({
    createdBy: auth.ctx.userId,
    title,
    body: details,
    category,
    priority,
  })
  return NextResponse.json({ ticket })
}
