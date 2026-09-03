import { getSql } from './db-connection'

export async function ensureTicketSchema() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'other',
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'normal',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS support_ticket_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status, updated_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_support_tickets_created_by ON support_tickets (created_by)`
}

export const TICKET_STATUSES = ['open', 'in_progress', 'waiting', 'resolved', 'closed'] as const
export const TICKET_PRIORITIES = ['low', 'normal', 'high'] as const
export const TICKET_CATEGORIES = [
  'api',
  'integration',
  'calculator',
  'export',
  'access',
  'other',
] as const

export type TicketStatus = (typeof TICKET_STATUSES)[number]
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]
export type TicketCategory = (typeof TICKET_CATEGORIES)[number]

export interface SupportTicket {
  id: string
  createdBy: string
  createdByEmail: string
  assignedTo: string | null
  assignedToEmail: string | null
  title: string
  body: string
  category: TicketCategory
  status: TicketStatus
  priority: TicketPriority
  commentCount: number
  createdAt: string
  updatedAt: string
}

export interface SupportTicketComment {
  id: string
  ticketId: string
  userId: string
  userEmail: string
  body: string
  createdAt: string
}

function isStatus(value: string): value is TicketStatus {
  return (TICKET_STATUSES as readonly string[]).includes(value)
}

function isPriority(value: string): value is TicketPriority {
  return (TICKET_PRIORITIES as readonly string[]).includes(value)
}

function isCategory(value: string): value is TicketCategory {
  return (TICKET_CATEGORIES as readonly string[]).includes(value)
}

export function parseStatus(value: unknown): TicketStatus | null {
  return typeof value === 'string' && isStatus(value) ? value : null
}

export function parsePriority(value: unknown): TicketPriority | null {
  return typeof value === 'string' && isPriority(value) ? value : null
}

export function parseCategory(value: unknown): TicketCategory | null {
  return typeof value === 'string' && isCategory(value) ? value : null
}

interface TicketRow {
  id: string
  created_by: string
  created_by_email: string
  assigned_to: string | null
  assigned_to_email: string | null
  title: string
  body: string
  category: string
  status: string
  priority: string
  comment_count: number | string
  created_at: string
  updated_at: string
}

function mapTicket(row: TicketRow): SupportTicket {
  return {
    id: row.id,
    createdBy: row.created_by,
    createdByEmail: row.created_by_email,
    assignedTo: row.assigned_to,
    assignedToEmail: row.assigned_to_email,
    title: row.title,
    body: row.body,
    category: isCategory(row.category) ? row.category : 'other',
    status: isStatus(row.status) ? row.status : 'open',
    priority: isPriority(row.priority) ? row.priority : 'normal',
    commentCount: Number(row.comment_count ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listTickets(options: {
  createdBy?: string
  status?: TicketStatus
}): Promise<SupportTicket[]> {
  const sql = getSql()
  const createdBy = options.createdBy ?? null
  const status = options.status ?? null
  const rows = await sql`
    SELECT
      t.id, t.created_by, creator.email AS created_by_email,
      t.assigned_to, assignee.email AS assigned_to_email,
      t.title, t.body, t.category, t.status, t.priority,
      t.created_at, t.updated_at,
      (SELECT COUNT(*) FROM support_ticket_comments c WHERE c.ticket_id = t.id) AS comment_count
    FROM support_tickets t
    JOIN users creator ON creator.id = t.created_by
    LEFT JOIN users assignee ON assignee.id = t.assigned_to
    WHERE (${createdBy}::uuid IS NULL OR t.created_by = ${createdBy}::uuid)
      AND (${status}::text IS NULL OR t.status = ${status})
    ORDER BY t.updated_at DESC
  `
  return (rows as TicketRow[]).map(mapTicket)
}

export async function getTicket(id: string): Promise<SupportTicket | null> {
  const sql = getSql()
  const rows = await sql`
    SELECT
      t.id, t.created_by, creator.email AS created_by_email,
      t.assigned_to, assignee.email AS assigned_to_email,
      t.title, t.body, t.category, t.status, t.priority,
      t.created_at, t.updated_at,
      (SELECT COUNT(*) FROM support_ticket_comments c WHERE c.ticket_id = t.id) AS comment_count
    FROM support_tickets t
    JOIN users creator ON creator.id = t.created_by
    LEFT JOIN users assignee ON assignee.id = t.assigned_to
    WHERE t.id = ${id}
    LIMIT 1
  `
  const row = rows[0] as TicketRow | undefined
  return row ? mapTicket(row) : null
}

export async function createTicket(input: {
  createdBy: string
  title: string
  body: string
  category: TicketCategory
  priority: TicketPriority
}): Promise<SupportTicket> {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO support_tickets (created_by, title, body, category, priority)
    VALUES (${input.createdBy}, ${input.title}, ${input.body}, ${input.category}, ${input.priority})
    RETURNING id
  `
  const created = await getTicket((rows[0] as { id: string }).id)
  if (!created) throw new Error('Failed to load created ticket')
  return created
}

export async function updateTicket(
  id: string,
  updates: {
    status?: TicketStatus
    priority?: TicketPriority
    assignedTo?: string | null
    title?: string
    body?: string
    category?: TicketCategory
  },
): Promise<SupportTicket | null> {
  const existing = await getTicket(id)
  if (!existing) return null

  const status = updates.status ?? existing.status
  const priority = updates.priority ?? existing.priority
  const title = updates.title ?? existing.title
  const body = updates.body ?? existing.body
  const category = updates.category ?? existing.category
  const assignedTo = updates.assignedTo === undefined ? existing.assignedTo : updates.assignedTo

  const sql = getSql()
  await sql`
    UPDATE support_tickets
    SET status = ${status},
        priority = ${priority},
        title = ${title},
        body = ${body},
        category = ${category},
        assigned_to = ${assignedTo},
        updated_at = now()
    WHERE id = ${id}
  `
  return getTicket(id)
}

export async function listTicketComments(ticketId: string): Promise<SupportTicketComment[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT c.id, c.ticket_id, c.user_id, u.email AS user_email, c.body, c.created_at
    FROM support_ticket_comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.ticket_id = ${ticketId}
    ORDER BY c.created_at ASC
  `
  return (
    rows as Array<{
      id: string
      ticket_id: string
      user_id: string
      user_email: string
      body: string
      created_at: string
    }>
  ).map((row) => ({
    id: row.id,
    ticketId: row.ticket_id,
    userId: row.user_id,
    userEmail: row.user_email,
    body: row.body,
    createdAt: row.created_at,
  }))
}

export async function addTicketComment(input: {
  ticketId: string
  userId: string
  body: string
}): Promise<SupportTicketComment> {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO support_ticket_comments (ticket_id, user_id, body)
    VALUES (${input.ticketId}, ${input.userId}, ${input.body})
    RETURNING id
  `
  await sql`UPDATE support_tickets SET updated_at = now() WHERE id = ${input.ticketId}`
  const comments = await listTicketComments(input.ticketId)
  const created = comments.find((c) => c.id === (rows[0] as { id: string }).id)
  if (!created) throw new Error('Failed to load comment')
  return created
}
