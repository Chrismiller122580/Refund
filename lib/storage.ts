import type { FreedomInputs } from './calculators/freedom'
import type { GapInputs } from './calculators/gap'

export type CaseType = 'freedom' | 'gap'

export interface SavedCase {
  id: string
  name: string
  type: CaseType
  inputs: FreedomInputs | GapInputs
  savedAt: string
}

export async function listCases(type: CaseType): Promise<SavedCase[]> {
  const res = await fetch(`/api/cases?type=${type}`)
  if (!res.ok) throw new Error('Failed to load cases')
  const data = await res.json()
  return data.cases as SavedCase[]
}

export async function saveCase(
  name: string,
  type: CaseType,
  inputs: FreedomInputs | GapInputs,
): Promise<SavedCase> {
  const res = await fetch('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, inputs }),
  })
  if (!res.ok) throw new Error('Failed to save case')
  const data = await res.json()
  return data.case as SavedCase
}

export async function deleteCase(id: string): Promise<void> {
  const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete case')
}
