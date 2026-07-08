import type { FreedomInputs, FreedomResults } from './calculators/freedom'
import type { GapInputs, GapResults } from './calculators/gap'
import type { FreedomRecommendation } from './calculators/recommendation'
import type { ValidationWarning } from './calculators/validation'

export type CaseType = 'freedom' | 'gap'

export interface SavedCase {
  id: string
  name: string
  type: CaseType
  inputs: FreedomInputs | GapInputs
  results?: FreedomResults | GapResults
  warnings?: ValidationWarning[]
  recommendation?: FreedomRecommendation
  savedAt: string
  userEmail?: string
}

export interface ListCasesOptions {
  type?: CaseType
  q?: string
  limit?: number
}

function buildCasesUrl(options: ListCasesOptions = {}) {
  const params = new URLSearchParams()
  if (options.type) params.set('type', options.type)
  if (options.q?.trim()) params.set('q', options.q.trim())
  if (options.limit) params.set('limit', String(options.limit))
  const query = params.toString()
  return query ? `/api/cases?${query}` : '/api/cases'
}

export async function listCases(options: ListCasesOptions = {}): Promise<SavedCase[]> {
  const res = await fetch(buildCasesUrl(options))
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

export async function updateCase(
  id: string,
  name: string,
  inputs: FreedomInputs | GapInputs,
): Promise<SavedCase> {
  const res = await fetch(`/api/cases/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, inputs }),
  })
  if (!res.ok) throw new Error('Failed to update case')
  const data = await res.json()
  return data.case as SavedCase
}

export async function deleteCase(id: string): Promise<void> {
  const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete case')
}

export async function listAllRecords(options: ListCasesOptions = {}): Promise<SavedCase[]> {
  const params = new URLSearchParams()
  if (options.type) params.set('type', options.type)
  if (options.q?.trim()) params.set('q', options.q.trim())
  if (options.limit) params.set('limit', String(options.limit))
  const query = params.toString()
  const res = await fetch(query ? `/api/admin/records?${query}` : '/api/admin/records')
  if (!res.ok) throw new Error('Failed to load records')
  const data = await res.json()
  return data.records as SavedCase[]
}