'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import { AppShell } from './AppShell'
import { Field } from './Field'
import {
  inputClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
  subtlePanelClass,
} from '@/lib/ui-classes'
import type {
  SupportTicket,
  SupportTicketComment,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '@/lib/tickets'

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting: 'Waiting',
  resolved: 'Resolved',
  closed: 'Closed',
}

const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
}

const CATEGORY_LABEL: Record<TicketCategory, string> = {
  api: 'API key / API',
  integration: 'Site integration',
  calculator: 'Calculator',
  export: 'Export',
  access: 'Login / access',
  other: 'Other',
}

function statusClass(status: TicketStatus) {
  if (status === 'open') return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
  if (status === 'in_progress') return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
  if (status === 'waiting') return 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300'
  if (status === 'resolved') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
  return 'bg-slate-100 text-slate-700 dark:text-slate-300'
}

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function TicketBoard() {
  const { user } = useAuth()
  const staff = user?.role === 'admin' || user?.role === 'it'
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<TicketCategory>('other')
  const [priority, setPriority] = useState<TicketPriority>('normal')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<SupportTicket | null>(null)
  const [comments, setComments] = useState<SupportTicketComment[]>([])
  const [commentText, setCommentText] = useState('')
  const [staffUsers, setStaffUsers] = useState<Array<{ id: string; email: string }>>([])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = filter === 'all' ? '' : `?status=${filter}`
      const res = await fetch(`/api/tickets${qs}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load tickets')
      setTickets(data.tickets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!staff) return
    fetch('/api/admin/users')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.users) return
        setStaffUsers(
          data.users
            .filter((u: { is_active: boolean; role: string }) => u.is_active)
            .map((u: { id: string; email: string }) => ({ id: u.id, email: u.email })),
        )
      })
      .catch(() => {})
  }, [staff])

  const openTicket = async (id: string) => {
    setSelectedId(id)
    setCommentText('')
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        fetch(`/api/tickets/${id}`),
        fetch(`/api/tickets/${id}/comments`),
      ])
      const ticketData = await ticketRes.json()
      const commentsData = await commentsRes.json()
      if (!ticketRes.ok) throw new Error(ticketData.error ?? 'Failed to load ticket')
      setSelected(ticketData.ticket)
      setComments(commentsData.comments ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body, category, priority }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create ticket')
      setTitle('')
      setBody('')
      setCategory('other')
      setPriority('normal')
      await refresh()
      if (data.ticket?.id) await openTicket(data.ticket.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
    } finally {
      setSaving(false)
    }
  }

  const patchTicket = async (updates: Record<string, unknown>) => {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/tickets/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update ticket')
      setSelected(data.ticket)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || !commentText.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/tickets/${selected.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentText.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add comment')
      setCommentText('')
      setComments((current) => [...current, data.comment])
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell active="tickets">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Support tickets</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {staff
              ? 'IT board — all user tickets. Update status, assign, and reply.'
              : 'Open a ticket for API, integration, calculator, or export issues. IT will see it on the board.'}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <section className={panelClass}>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">New ticket</h2>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Short summary"
                />
              </Field>
              <Field label="Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className={selectClass}
                >
                  {Object.entries(CATEGORY_LABEL).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className={selectClass}
                >
                  {Object.entries(PRIORITY_LABEL).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Details">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="What should IT test or fix? Include system names if this is an API connection issue."
              />
            </Field>
            <button type="submit" disabled={saving} className={primaryButtonClass}>
              {saving ? 'Saving…' : 'Create ticket'}
            </button>
          </form>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {staff ? 'Board' : 'My tickets'}
              </h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as TicketStatus | 'all')}
                className={`${selectClass} w-auto`}
              >
                <option value="all">All statuses</option>
                {Object.entries(STATUS_LABEL).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {loading ? (
              <p className="px-4 py-8 text-sm text-slate-500">Loading tickets…</p>
            ) : tickets.length === 0 ? (
              <p className="px-4 py-8 text-sm text-slate-500">No tickets yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {tickets.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      type="button"
                      onClick={() => openTicket(ticket.id)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        selectedId === ticket.id ? 'bg-blue-50/70 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(ticket.status)}`}>
                          {STATUS_LABEL[ticket.status]}
                        </span>
                        {ticket.priority === 'high' && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            High
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{CATEGORY_LABEL[ticket.category]}</span>
                      </div>
                      <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{ticket.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {ticket.createdByEmail}
                        {ticket.assignedToEmail ? ` · assigned ${ticket.assignedToEmail}` : ''}
                        {` · ${ticket.commentCount} comment${ticket.commentCount === 1 ? '' : 's'}`}
                        {` · ${formatWhen(ticket.updatedAt)}`}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={panelClass}>
            {!selected ? (
              <p className="text-sm text-slate-500">Select a ticket to view details and replies.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selected.title}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    From {selected.createdByEmail} · {formatWhen(selected.createdAt)}
                  </p>
                </div>
                {selected.body && <p className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">{selected.body}</p>}

                {staff && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Status">
                      <select
                        value={selected.status}
                        onChange={(e) => patchTicket({ status: e.target.value })}
                        className={selectClass}
                      >
                        {Object.entries(STATUS_LABEL).map(([id, label]) => (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Priority">
                      <select
                        value={selected.priority}
                        onChange={(e) => patchTicket({ priority: e.target.value })}
                        className={selectClass}
                      >
                        {Object.entries(PRIORITY_LABEL).map(([id, label]) => (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Assign to">
                      <select
                        value={selected.assignedTo ?? ''}
                        onChange={(e) => patchTicket({ assignedTo: e.target.value || null })}
                        className={selectClass}
                      >
                        <option value="">Unassigned</option>
                        {staffUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.email}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}

                <div className={subtlePanelClass}>
                  <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">Conversation</h3>
                  {comments.length === 0 ? (
                    <p className="text-sm text-slate-500">No replies yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {comments.map((comment) => (
                        <li key={comment.id} className="text-sm">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {comment.userEmail}{' '}
                            <span className="font-normal text-xs text-slate-500">{formatWhen(comment.createdAt)}</span>
                          </p>
                          <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{comment.body}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <form onSubmit={handleComment} className="mt-4 space-y-2">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className={inputClass}
                      placeholder="Add a reply…"
                    />
                    <button type="submit" disabled={saving || !commentText.trim()} className={secondaryButtonClass}>
                      Reply
                    </button>
                  </form>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  )
}
