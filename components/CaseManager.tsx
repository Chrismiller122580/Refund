'use client'

import { useCallback, useEffect, useState } from 'react'
import type { FreedomInputs, FreedomResults } from '@/lib/calculators/freedom'
import type { GapInputs, GapResults } from '@/lib/calculators/gap'
import {
  deleteCase,
  listCases,
  saveCase,
  updateCase,
  type CaseType,
  type SavedCase,
} from '@/lib/storage'
import {
  calculatorPanelClass,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  selectClass,
  subtlePanelClass,
} from '@/lib/ui-classes'

interface CaseManagerProps<T extends FreedomInputs | GapInputs> {
  type: CaseType
  inputs: T
  onLoad: (inputs: T) => void
  onReset: () => void
}

function formatSavedAt(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

export function CaseManager<T extends FreedomInputs | GapInputs>({
  type,
  inputs,
  onLoad,
  onReset,
}: CaseManagerProps<T>) {
  const [cases, setCases] = useState<SavedCase[]>([])
  const [search, setSearch] = useState('')
  const [showSave, setShowSave] = useState(false)
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCases(
        await listCases({
          type,
          q: search.trim() || undefined,
          limit: 50,
        }),
      )
    } catch {
      setError('Failed to load saved records')
    } finally {
      setLoading(false)
    }
  }, [type, search])

  useEffect(() => {
    const timer = setTimeout(refresh, search ? 250 : 0)
    return () => clearTimeout(timer)
  }, [refresh, search])

  const openSave = () => {
    if (selectedId) {
      const current = cases.find((c) => c.id === selectedId)
      setName(current?.name ?? '')
    } else {
      setName('')
    }
    setShowSave(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const saved = selectedId
        ? await updateCase(selectedId, name.trim(), inputs)
        : await saveCase(name.trim(), type, inputs)
      setName('')
      setShowSave(false)
      setSelectedId(saved.id)
      await refresh()
    } catch {
      setError(selectedId ? 'Failed to update record' : 'Failed to save record')
    } finally {
      setSaving(false)
    }
  }

  const handleLoad = (id: string) => {
    const found = cases.find((c) => c.id === id)
    if (!found) return
    onLoad(found.inputs as T)
    setSelectedId(id)
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      await deleteCase(id)
      if (selectedId === id) setSelectedId('')
      await refresh()
    } catch {
      setError('Failed to delete record')
    }
  }

  return (
    <div className={`${calculatorPanelClass} space-y-3`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Saved records</h3>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, date, amount…"
          className={`${inputClass} min-w-[200px] flex-1 py-1.5 sm:max-w-xs`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => (showSave ? setShowSave(false) : openSave())}
          className={secondaryButtonClass}
        >
          {selectedId ? 'Update Record' : 'Save Record'}
        </button>
        <select
          value={selectedId}
          onChange={(e) => handleLoad(e.target.value)}
          disabled={loading}
          className={`${selectClass} py-1.5 disabled:opacity-50`}
        >
          <option value="">{loading ? 'Loading…' : 'Load record…'}</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {customerTotal(c) ? ` — ${customerTotal(c)}` : ''}
            </option>
          ))}
        </select>
        {selectedId && (
          <button type="button" onClick={() => handleDelete(selectedId)} className={dangerButtonClass}>
            Delete
          </button>
        )}
        <button type="button" onClick={onReset} className={secondaryButtonClass}>
          New Case
        </button>
      </div>

      {cases.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Dates</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cases.map((record, index) => (
                <tr
                  key={record.id}
                  className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    index % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-900/40' : ''
                  } ${selectedId === record.id ? 'bg-blue-50 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/30 dark:ring-blue-800' : ''}`}
                  onClick={() => handleLoad(record.id)}
                >
                  <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">{record.name}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    {record.inputs.startDate} → {record.inputs.endDate}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{customerTotal(record) ?? '—'}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{formatSavedAt(record.savedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {showSave && (
        <div className={`${subtlePanelClass} flex w-full flex-wrap items-center gap-2 sm:w-auto`}>
          {selectedId && (
            <span className="w-full text-xs text-slate-500 dark:text-slate-400">
              Saves inputs and full calculation results. Email sent on new records.
            </span>
          )}
          {!selectedId && (
            <span className="w-full text-xs text-slate-500 dark:text-slate-400">
              Saves inputs and full calculation results. You will receive an email when created.
            </span>
          )}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Record name"
            className={`${inputClass} min-w-[160px] flex-1 py-1.5`}
          />
          <button type="button" onClick={handleSave} disabled={saving} className={primaryButtonClass}>
            {saving ? 'Saving…' : selectedId ? 'Update' : 'Save'}
          </button>
          <button type="button" onClick={() => setShowSave(false)} className={secondaryButtonClass}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}