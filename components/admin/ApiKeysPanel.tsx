'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PublicApiKey, PublicUser } from '@/lib/db'
import { inputClass, selectClass } from '@/lib/ui-classes'
import { Field } from '../Field'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface CreatedKey {
  name: string
  key: string
  keyPrefix: string
  emailSent: boolean
  emailedTo: string
}

export function ApiKeysPanel() {
  const [apiKeys, setApiKeys] = useState<PublicApiKey[]>([])
  const [users, setUsers] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null)
  const [copied, setCopied] = useState(false)

  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [keysRes, usersRes] = await Promise.all([
        fetch('/api/admin/api-keys'),
        fetch('/api/admin/users'),
      ])
      const keysData = await keysRes.json()
      const usersData = await usersRes.json()
      if (!keysRes.ok) throw new Error(keysData.error ?? 'Failed to load API keys')
      if (!usersRes.ok) throw new Error(usersData.error ?? 'Failed to load users')
      setApiKeys(keysData.apiKeys)
      const activeUsers = usersData.users.filter((u: PublicUser) => u.is_active)
      setUsers(activeUsers)
      setUserId((current) => current || activeUsers[0]?.id || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !name.trim()) return
    setSaving(true)
    setError(null)
    setCreatedKey(null)
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create API key')
      setCreatedKey({
        name: data.apiKey.name,
        key: data.apiKey.key,
        keyPrefix: data.apiKey.keyPrefix,
        emailSent: data.emailSent ?? false,
        emailedTo: data.emailedTo ?? '',
      })
      setName('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key')
    } finally {
      setSaving(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this API key? Integrations using it will stop working.')) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to revoke API key')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key')
    }
  }

  const copyKey = async () => {
    if (!createdKey) return
    await navigator.clipboard.writeText(createdKey.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeKeys = apiKeys.filter((k) => !k.revokedAt)

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Create API key</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Keys inherit the user&apos;s role. Create keys for <code className="text-xs">user</code>-role
          service accounts, not admins.
        </p>
        <form onSubmit={handleCreate} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="User">
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className={selectClass}
            >
              {users.length === 0 ? (
                <option value="">No active users</option>
              ) : (
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.role})
                  </option>
                ))
              )}
            </select>
          </Field>
          <Field label="Key name" hint="e.g. CRM integration, staging">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Integration name"
              className={inputClass}
            />
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving || users.length === 0}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Creating…' : 'Create API key'}
            </button>
          </div>
        </form>
      </section>

      {createdKey && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h3 className="font-semibold text-amber-900">API key created — copy it now</h3>
          <p className="mt-1 text-sm text-amber-800">
            This secret is shown only once. Store it securely before closing this notice.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <code className="flex-1 break-all rounded-lg border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
              {createdKey.key}
            </code>
            <button
              type="button"
              onClick={copyKey}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={() => setCreatedKey(null)}
              className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              Dismiss
            </button>
          </div>
          <p className="mt-3 text-xs text-amber-700">
            Prefix: <span className="font-mono">{createdKey.keyPrefix}</span> · Name:{' '}
            {createdKey.name}
            {createdKey.emailSent ? (
              <> · Emailed to <span className="font-medium">{createdKey.emailedTo}</span></>
            ) : createdKey.emailedTo ? (
              <> · Email not sent (check RESEND_API_KEY / EMAIL_FROM)</>
            ) : null}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">API keys</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {activeKeys.length} active · {apiKeys.length} total
          </p>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">Loading API keys…</p>
        ) : apiKeys.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">No API keys yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Prefix</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Last used</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950/80">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{key.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{key.userEmail}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{key.keyPrefix}…</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(key.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(key.lastUsedAt)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          key.revokedAt
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {key.revokedAt ? 'Revoked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!key.revokedAt && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(key.id)}
                          className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-50"
                        >
                          Revoke
                        </button>
                      )}
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