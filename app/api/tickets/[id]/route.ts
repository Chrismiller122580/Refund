import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import { canManageTickets } from '@/lib/auth'
import { ensureSchema } from '@/lib/db'
import {
  ensureTicketSchema,
  getTicket,
  parseCategory,
  parsePriority,
  parseStatus,
  updateTicket,
} from '@/lib/tickets'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  const { id } = await params
  await ensureSchema()
  await ensureTicketSchema()
  const ticket = await getTicket(id)
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!canManageTickets(auth.ctx.role) && ticket.createdBy !== auth.ctx.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json({ ticket })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await parseJsonBody<{
    status?: string
    priority?: string
    assignedTo?: string | null
    title?: string
    body?: string
    category?: string
  }>(request)
  if (body instanceof Response) return body

  await ensureSchema()
  await ensureTicketSchema()
  const existing = await getTicket(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const staff = canManageTickets(auth.ctx.role)
  const owner = existing.createdBy === auth.ctx.userId
  if (!staff && !owner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!staff && (body.status || body.assignedTo !== undefined)) {
    return NextResponse.json({ error: 'Only IT/admin can change status or assignment' }, { status: 403 })
  }

  const ticket = await updateTicket(id, {
    status: staff ? parseStatus(body.status) ?? undefined : undefined,
    priority: parsePriority(body.priority) ?? undefined,
    assignedTo: staff ? (body.assignedTo === undefined ? undefined : body.assignedTo) : undefined,
    title: body.title?.trim(),
    body: body.body,
    category: parseCategory(body.category) ?? undefined,
  })
  return NextResponse.json({ ticket })
}
