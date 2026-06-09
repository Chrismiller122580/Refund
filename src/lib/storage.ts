import type { FreedomInputs } from './calculators/freedom'
import type { GapInputs } from './calculators/gap'

const STORAGE_KEY = 'refund-calculators:cases'

export type CaseType = 'freedom' | 'gap'

export interface SavedCase {
  id: string
  name: string
  type: CaseType
  inputs: FreedomInputs | GapInputs
  savedAt: string
}

function readAll(): SavedCase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedCase[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(cases: SavedCase[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
}

export function listCases(type: CaseType): SavedCase[] {
  return readAll()
    .filter((c) => c.type === type)
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

export function saveCase(name: string, type: CaseType, inputs: FreedomInputs | GapInputs): SavedCase {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Case name is required')

  const entry: SavedCase = {
    id: crypto.randomUUID(),
    name: trimmed,
    type,
    inputs,
    savedAt: new Date().toISOString(),
  }

  writeAll([entry, ...readAll()])
  return entry
}

export function deleteCase(id: string) {
  writeAll(readAll().filter((c) => c.id !== id))
}

export function getCase(id: string): SavedCase | undefined {
  return readAll().find((c) => c.id === id)
}
