'use client'

import { useState } from 'react'
import { deleteCase, listCases, saveCase, type CaseType } from '@/lib/storage'
import type { FreedomInputs } from '@/lib/calculators/freedom'
import type { GapInputs } from '@/lib/calculators/gap'

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
  const [cases, setCases] = useState(() => listCases(type))
  const [showSave, setShowSave] = useState(false)
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState('')

  const refresh = () => setCases(listCases(type))

  const handleSave = () => {
    if (!name.trim()) return
    saveCase(name, type, inputs)
    setName('')
    setShowSave(false)
    refresh()
  }

  const handleLoad = (id: string) => {
    const found = cases.find((c) => c.id === id)
    if (!found) return
    onLoad(found.inputs as T)
    setSelectedId(id)
  }

  const handleDelete = (id: string) => {
    deleteCase(id)
    if (selectedId === id) setSelectedId('')
    refresh()
  }

  return (
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
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
      >
        <option value="">Load Case…</option>
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
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save
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
