'use client'

import { useCallback, useEffect, useState } from 'react'
import type { FreedomResults } from '@/lib/calculators/freedom'
import type { GapResults } from '@/lib/calculators/gap'
import { listAllRecords, type CaseType, type SavedCase } from '@/lib/storage'

function formatSavedAt(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function customerTotal(record: SavedCase): string | null {
  if (!record.results) return null
  if (record.type === 'gap') {
    return `$${(record.results as GapResults).refund.totalCustomerReceives.toFixed(2)}`
  }
  const freedom = record.results as FreedomResults
  const rec = record.recommendation
  const total =
    rec?.recommended === 'days' || rec?.milesDisqualified
      ? freedom.refundPerDays.totalCustomerReceives
      : freedom.refundPerMiles.totalCustomerReceives
  return `$${total.toFixed(2)}`
}

export function RecordsPanel() {
  const [records, setRecords] = useState<SavedCase[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | CaseType>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRecords(
        await listAllRecords({
          q: search.trim() || undefined,
          type: typeFilter || undefined,
          limit: 100,
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    const timer = setTimeout(refresh, search ? 250 : 0)
    return () => clearTimeout(timer)
  }, [refresh, search])

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Search all records</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Search across every saved Freedom and GAP calculation by name, date, amount, or user.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records…"
            className="min-w-[240px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as '' | CaseType)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            <option value="freedom">Freedom</option>
            <option value="gap">GAP</option>
          </select>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Records</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{records.length} shown</p>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">Loading records…</p>
        ) : records.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">No records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Customer total</th>
                  <th className="px-6 py-3">Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950/80">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{record.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium uppercase text-slate-700 dark:text-slate-300">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{record.userEmail ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {record.inputs.startDate} → {record.inputs.endDate}
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{customerTotal(record) ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatSavedAt(record.savedAt)}</td>
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