import type { FreedomInputs } from './calculators/freedom'
import type { GapInputs } from './calculators/gap'
import { getSql } from './db-connection'
import type { CaseType, SavedCase } from './storage'

export interface DbUser {
  id: string
  email: string
  password: string
  created_at: string
}

export async function ensureSchema() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS cases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('freedom', 'gap')),
      inputs JSONB NOT NULL,
      saved_at TIMESTAMPTZ DEFAULT now()
    )
  `
}

export async function findUserByEmail(email: string): Promise<DbUser | undefined> {
  const sql = getSql()
  const rows = await sql`SELECT id, email, password, created_at FROM users WHERE email = ${email}`
  return rows[0] as DbUser | undefined
}

export async function createUser(email: string, passwordHash: string) {
  const sql = getSql()
  const rows = await sql`INSERT INTO users (email, password) VALUES (${email}, ${passwordHash}) RETURNING id, email, created_at`
  return rows[0]
}

interface DbCaseRow {
  id: string
  name: string
  type: CaseType
  inputs: FreedomInputs | GapInputs
  saved_at: string
}

function mapCase(row: DbCaseRow): SavedCase {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    inputs: row.inputs,
    savedAt: row.saved_at,
  }
}

export async function listCasesForUser(userId: string, type: CaseType): Promise<SavedCase[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, name, type, inputs, saved_at
    FROM cases
    WHERE user_id = ${userId} AND type = ${type}
    ORDER BY saved_at DESC
  `
  return (rows as DbCaseRow[]).map(mapCase)
}

export async function createCase(
  userId: string,
  name: string,
  type: CaseType,
  inputs: FreedomInputs | GapInputs,
): Promise<SavedCase> {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO cases (user_id, name, type, inputs)
    VALUES (${userId}, ${name}, ${type}, ${JSON.stringify(inputs)}::jsonb)
    RETURNING id, name, type, inputs, saved_at
  `
  return mapCase(rows[0] as DbCaseRow)
}

export async function deleteCaseForUser(userId: string, caseId: string): Promise<boolean> {
  const sql = getSql()
  const rows = await sql`
    DELETE FROM cases WHERE id = ${caseId} AND user_id = ${userId} RETURNING id
  `
  return rows.length > 0
}
