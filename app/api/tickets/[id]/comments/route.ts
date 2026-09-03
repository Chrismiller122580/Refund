import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { parseJsonBody } from '@/lib/api-inputs'
import { canManageTickets } from '@/lib/auth'
import { ensureSchema } from '@/lib/db'
import { addTicketComment, ensureTicketSchema, getTicket, listTicketComments } from '@/lib/tickets'

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
  const comments = await listTicketComments(id)
  return NextResponse.json({ comments })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await parseJsonBody<{ body?: string }>(request)
  if (body instanceof Response) return body
  const text = body.body?.trim()
  if (!text) {
    return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
  }

  await ensureSchema()
  await ensureTicketSchema()
  const ticket = await getTicket(id)
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!canManageTickets(auth.ctx.role) && ticket.createdBy !== auth.ctx.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const comment = await addTicketComment({
    ticketId: id,
    userId: auth.ctx.userId,
    body: text,
  })
  return NextResponse.json({ comment })
}
