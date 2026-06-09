'use client'

import { useCallback, useEffect, useState } from 'react'
import type { FreedomInputs } from '@/lib/calculators/freedom'
import type { GapInputs } from '@/lib/calculators/gap'
import { deleteCase, listCases, saveCase, type CaseType, type SavedCase } from '@/lib/storage'

interface CaseManagerProps<T extends FreedomInputs | GapInputs> {
  type: CaseType
  inputs: T
  onLoad: (inputs: T) => void
  onReset: () => void
}

export function CaseManager<T extends FreedomInputs | GapInputs>({
  type,
  inputs,
  onLoad,
  onReset,
}: CaseManagerProps<T>) {
  const [cases, setCases] = useState<SavedCase[]>([])
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
      setCases(await listCases(type))
    } catch {
      setError('Failed to load saved cases')
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const saved = await saveCase(name, type, inputs)
      setName('')
      setShowSave(false)
      setSelectedId(saved.id)
      await refresh()
    } catch {
      setError('Failed to save case')
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
      setError('Failed to delete case')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowSave((v) => !v)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Save Case
        </button>
        <select
          value={selectedId}
          onChange={(e) => handleLoad(e.target.value)}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
        >
          <option value="">{loading ? 'Loading cases…' : 'Load Case…'}</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {selectedId && (
          <button
            type="button"
            onClick={() => handleDelete(selectedId)}
            className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          New Case
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {showSave && (
        <div className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:w-auto">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Case name"
            className="min-w-[160px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setShowSave(false)}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
