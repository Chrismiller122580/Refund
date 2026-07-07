import type { UserRole } from './auth'
import type { FreedomInputs } from './calculators/freedom'
import type { GapInputs } from './calculators/gap'
import { hashPassword } from './auth'
import { getSql } from './db-connection'
import type { CaseType, SavedCase } from './storage'

export interface DbUser {
  id: string
  email: string
  password: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface PublicUser {
  id: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface DbApiKey {
  id: string
  user_id: string
  name: string
  key_prefix: string
  key_hash: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

export interface PublicApiKey {
  id: string
  userId: string
  userEmail: string
  name: string
  keyPrefix: string
  createdAt: string
  lastUsedAt: string | null
  revokedAt: string | null
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
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`
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
  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      last_used_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ
    )
  `
}

function mapPublicUser(row: DbUser): PublicUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role ?? 'user',
    is_active: row.is_active ?? true,
    created_at: row.created_at,
  }
}

/** Sync admin user from ADMIN_EMAIL / ADMIN_PASSWORD env vars */
export async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return

  const sql = getSql()
  const hash = await hashPassword(password)
  await sql`
    INSERT INTO users (email, password, role, is_active)
    VALUES (${email}, ${hash}, 'admin', true)
    ON CONFLICT (email) DO UPDATE SET
      password = EXCLUDED.password,
      role = 'admin',
      is_active = true
  `
}

export async function findUserByEmail(email: string): Promise<DbUser | undefined> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, email, password, role, is_active, created_at
    FROM users WHERE email = ${email}
  `
  return rows[0] as DbUser | undefined
}

export async function findUserById(id: string): Promise<DbUser | undefined> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, email, password, role, is_active, created_at
    FROM users WHERE id = ${id}
  `
  return rows[0] as DbUser | undefined
}

export async function listUsers(): Promise<PublicUser[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, email, password, role, is_active, created_at
    FROM users
    ORDER BY created_at DESC
  `
  return (rows as DbUser[]).map(mapPublicUser)
}

export async function createUser(
  email: string,
  passwordHash: string,
  role: UserRole = 'user',
): Promise<PublicUser> {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO users (email, password, role, is_active)
    VALUES (${email.toLowerCase().trim()}, ${passwordHash}, ${role}, true)
    RETURNING id, email, password, role, is_active, created_at
  `
  return mapPublicUser(rows[0] as DbUser)
}

export async function updateUser(
  id: string,
  updates: { role?: UserRole; is_active?: boolean; passwordHash?: string },
): Promise<PublicUser | null> {
  const sql = getSql()
  const existing = await findUserById(id)
  if (!existing) return null

  const role = updates.role ?? existing.role
  const is_active = updates.is_active ?? existing.is_active
  const password = updates.passwordHash ?? existing.password

  const rows = await sql`
    UPDATE users
    SET role = ${role}, is_active = ${is_active}, password = ${password}
    WHERE id = ${id}
    RETURNING id, email, password, role, is_active, created_at
  `
  return mapPublicUser(rows[0] as DbUser)
}

export async function createApiKeyRecord(
  userId: string,
  name: string,
  keyPrefix: string,
  keyHash: string,
): Promise<DbApiKey> {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO api_keys (user_id, name, key_prefix, key_hash)
    VALUES (${userId}, ${name}, ${keyPrefix}, ${keyHash})
    RETURNING id, user_id, name, key_prefix, key_hash, created_at, last_used_at, revoked_at
  `
  return rows[0] as DbApiKey
}

export async function listApiKeys(): Promise<PublicApiKey[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT
      k.id,
      k.user_id,
      u.email AS user_email,
      k.name,
      k.key_prefix,
      k.created_at,
      k.last_used_at,
      k.revoked_at
    FROM api_keys k
    JOIN users u ON u.id = k.user_id
    ORDER BY k.created_at DESC
  `
  return rows.map((row: Record<string, string | null>) => ({
    id: row.id as string,
    userId: row.user_id as string,
    userEmail: row.user_email as string,
    name: row.name as string,
    keyPrefix: row.key_prefix as string,
    createdAt: row.created_at as string,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
  }))
}

export async function findActiveApiKeysByPrefix(prefix: string): Promise<DbApiKey[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, user_id, name, key_prefix, key_hash, created_at, last_used_at, revoked_at
    FROM api_keys
    WHERE key_prefix = ${prefix} AND revoked_at IS NULL
  `
  return rows as DbApiKey[]
}

export async function touchApiKeyLastUsed(id: string) {
  const sql = getSql()
  await sql`UPDATE api_keys SET last_used_at = now() WHERE id = ${id}`
}

export async function revokeApiKey(id: string): Promise<boolean> {
  const sql = getSql()
  const rows = await sql`
    UPDATE api_keys SET revoked_at = now()
    WHERE id = ${id} AND revoked_at IS NULL
    RETURNING id
  `
  return rows.length > 0
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

export async function updateCaseForUser(
  userId: string,
  caseId: string,
  name: string,
  inputs: FreedomInputs | GapInputs,
): Promise<SavedCase | null> {
  const sql = getSql()
  const rows = await sql`
    UPDATE cases
    SET name = ${name}, inputs = ${JSON.stringify(inputs)}::jsonb, saved_at = now()
    WHERE id = ${caseId} AND user_id = ${userId}
    RETURNING id, name, type, inputs, saved_at
  `
  if (rows.length === 0) return null
  return mapCase(rows[0] as DbCaseRow)
}

export async function deleteCaseForUser(userId: string, caseId: string): Promise<boolean> {
  const sql = getSql()
  const rows = await sql`
    DELETE FROM cases WHERE id = ${caseId} AND user_id = ${userId} RETURNING id
  `
  return rows.length > 0
}