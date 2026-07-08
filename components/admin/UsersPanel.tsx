'use client'

import { useCallback, useEffect, useState } from 'react'
import type { UserRole } from '@/lib/auth'
import type { PublicUser } from '@/lib/db'
import { Field } from '../Field'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function UsersPanel() {
  const [users, setUsers] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('user')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load users')
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create user')
      setEmail('')
      setPassword('')
      setRole('user')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const patchUser = async (id: string, updates: { role?: UserRole; is_active?: boolean }) => {
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update user')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Create user</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Add service accounts for external integrations. Prefer the <code className="text-xs">user</code>{' '}
          role for API keys.
        </p>
        <form onSubmit={handleCreate} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={inputClass}
            />
          </Field>
          <Field label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={inputClass}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Users</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{users.length} total</p>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950/80">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            patchUser(user.id, {
                              role: user.role === 'admin' ? 'user' : 'admin',
                            })
                          }
                          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950"
                        >
                          Make {user.role === 'admin' ? 'user' : 'admin'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            patchUser(user.id, { is_active: !user.is_active })
                          }
                          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950"
                        >
                          {user.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}