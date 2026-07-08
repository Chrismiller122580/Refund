import type { UserRole } from './auth'
import type { FreedomInputs, FreedomResults } from './calculators/freedom'
import type { GapInputs, GapResults } from './calculators/gap'
import type { FreedomRecommendation } from './calculators/recommendation'
import type { ValidationWarning } from './calculators/validation'
import { hashPassword } from './auth'
import { getSql } from './db-connection'
import { buildSearchText } from './records'
import { getDefaultMappings } from './integrations/field-catalog'
import type {
  DbIntegrationConnection,
  DbIntegrationFieldMapping,
  IntegrationAuthConfig,
  IntegrationAuthType,
  IntegrationProductType,
  PublicIntegrationConnection,
  PublicIntegrationFieldMapping,
} from './integrations/types'
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
  await sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS results JSONB`
  await sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS warnings JSONB`
  await sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS recommendation JSONB`
  await sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS search_text TEXT`
  await sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS contract_number TEXT`
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
  await sql`
    CREATE TABLE IF NOT EXISTS integration_connections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
      product_type TEXT NOT NULL CHECK (product_type IN ('freedom', 'gap')),
      base_url TEXT NOT NULL DEFAULT '',
      lookup_path_template TEXT NOT NULL DEFAULT '/contracts/{contractNumber}',
      auth_type TEXT NOT NULL DEFAULT 'none' CHECK (auth_type IN ('none', 'bearer', 'api_key_header', 'basic')),
      auth_config JSONB NOT NULL DEFAULT '{}'::jsonb,
      is_active BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `
  await sql`ALTER TABLE integration_connections ADD COLUMN IF NOT EXISTS api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE`
  await sql`DELETE FROM integration_connections WHERE api_key_id IS NULL`
  await sql`ALTER TABLE integration_connections DROP CONSTRAINT IF EXISTS integration_connections_product_type_key`
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_integration_connections_api_key_product
    ON integration_connections (api_key_id, product_type)
  `
  await sql`
    CREATE TABLE IF NOT EXISTS integration_field_mappings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      connection_id UUID NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
      internal_field TEXT NOT NULL,
      external_field TEXT NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT true,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (connection_id, internal_field)
    )
  `

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  if (adminEmail) {
    await sql`
      UPDATE users SET role = 'admin', is_active = true WHERE email = ${adminEmail}
    `
  }
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
  const row = rows[0] as DbUser | undefined
  if (!row) return undefined
  return {
    ...row,
    role: row.role ?? 'user',
    is_active: row.is_active ?? true,
  }
}

export async function findUserById(id: string): Promise<DbUser | undefined> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, email, password, role, is_active, created_at
    FROM users WHERE id = ${id}
  `
  const row = rows[0] as DbUser | undefined
  if (!row) return undefined
  return {
    ...row,
    role: row.role ?? 'user',
    is_active: row.is_active ?? true,
  }
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

export async function reinstateApiKey(id: string): Promise<boolean> {
  const sql = getSql()
  const rows = await sql`
    UPDATE api_keys SET revoked_at = NULL
    WHERE id = ${id} AND revoked_at IS NOT NULL
    RETURNING id
  `
  return rows.length > 0
}

export async function deleteApiKey(id: string): Promise<boolean> {
  const sql = getSql()
  const rows = await sql`
    DELETE FROM api_keys
    WHERE id = ${id}
    RETURNING id
  `
  return rows.length > 0
}

interface DbCaseRow {
  id: string
  name: string
  contract_number?: string | null
  type: CaseType
  inputs: FreedomInputs | GapInputs
  results: FreedomResults | GapResults | null
  warnings: ValidationWarning[] | null
  recommendation: FreedomRecommendation | null
  saved_at: string
  user_email?: string
}

function mapCase(row: DbCaseRow): SavedCase {
  return {
    id: row.id,
    name: row.name,
    contractNumber: row.contract_number ?? undefined,
    type: row.type,
    inputs: row.inputs,
    results: row.results ?? undefined,
    warnings: row.warnings ?? undefined,
    recommendation: row.recommendation ?? undefined,
    savedAt: row.saved_at,
    userEmail: row.user_email,
  }
}

export interface ListCasesQuery {
  type?: CaseType
  q?: string
  limit?: number
}

export interface RecordSnapshotData {
  results: FreedomResults | GapResults
  warnings: ValidationWarning[]
  recommendation?: FreedomRecommendation
}

export async function listCasesForUser(
  userId: string,
  query: ListCasesQuery = {},
): Promise<SavedCase[]> {
  const sql = getSql()
  const limit = Math.min(query.limit ?? 100, 200)
  const search = query.q?.trim().toLowerCase() ?? ''
  const hasType = query.type === 'freedom' || query.type === 'gap'

  const rows = hasType
    ? search
      ? await sql`
          SELECT c.id, c.name, c.contract_number, c.type, c.inputs, c.results, c.warnings, c.recommendation, c.saved_at
          FROM cases c
          WHERE c.user_id = ${userId}
            AND c.type = ${query.type}
            AND c.search_text ILIKE ${'%' + search + '%'}
          ORDER BY c.saved_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT c.id, c.name, c.contract_number, c.type, c.inputs, c.results, c.warnings, c.recommendation, c.saved_at
          FROM cases c
          WHERE c.user_id = ${userId} AND c.type = ${query.type}
          ORDER BY c.saved_at DESC
          LIMIT ${limit}
        `
    : search
      ? await sql`
          SELECT c.id, c.name, c.contract_number, c.type, c.inputs, c.results, c.warnings, c.recommendation, c.saved_at
          FROM cases c
          WHERE c.user_id = ${userId}
            AND c.search_text ILIKE ${'%' + search + '%'}
          ORDER BY c.saved_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT c.id, c.name, c.contract_number, c.type, c.inputs, c.results, c.warnings, c.recommendation, c.saved_at
          FROM cases c
          WHERE c.user_id = ${userId}
          ORDER BY c.saved_at DESC
          LIMIT ${limit}
        `

  return (rows as DbCaseRow[]).map(mapCase)
}

export async function listAllRecords(query: ListCasesQuery = {}): Promise<SavedCase[]> {
  const sql = getSql()
  const limit = Math.min(query.limit ?? 100, 200)
  const search = query.q?.trim().toLowerCase() ?? ''
  const hasType = query.type === 'freedom' || query.type === 'gap'

  const rows = hasType
    ? search
      ? await sql`
          SELECT c.id, c.name, c.contract_number, c.type, c.inputs, c.results, c.warnings, c.recommendation, c.saved_at, u.email AS user_email
          FROM cases c
          JOIN users u ON u.id = c.user_id
          WHERE c.type = ${query.type}
            AND c.search_text ILIKE ${'%' + search + '%'}
          ORDER BY c.saved_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT c.id, c.name, c.contract_number, c.type, c.inputs, c.results, c.warnings, c.recommendation, c.saved_at, u.email AS user_email
          FROM cases c
          JOIN users u ON u.id = c.user_id
          WHERE c.type = ${query.type}
          ORDER BY c.saved_at DESC
          LIMIT ${limit}
        `
    : search
      ? await sql`
          SELECT c.id, c.name, c.contract_number, c.type, c.inputs, c.results, c.warnings, c.recommendation, c.saved_at, u.email AS user_email
          FROM cases c
          JOIN users u ON u.id = c.user_id
          WHERE c.search_text ILIKE ${'%' + search + '%'}
          ORDER BY c.saved_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT c.id, c.name, c.contract_number, c.type, c.inputs, c.results, c.warnings, c.recommendation, c.saved_at, u.email AS user_email
          FROM cases c
          JOIN users u ON u.id = c.user_id
          ORDER BY c.saved_at DESC
          LIMIT ${limit}
        `

  return (rows as DbCaseRow[]).map(mapCase)
}

export async function createCase(
  userId: string,
  name: string,
  type: CaseType,
  inputs: FreedomInputs | GapInputs,
  snapshot: RecordSnapshotData,
  contractNumber?: string,
): Promise<SavedCase> {
  const sql = getSql()
  const searchText = buildSearchText(
    name,
    contractNumber,
    type,
    inputs,
    snapshot.results,
    snapshot.recommendation,
  )
  const rows = await sql`
    INSERT INTO cases (user_id, name, contract_number, type, inputs, results, warnings, recommendation, search_text)
    VALUES (
      ${userId},
      ${name},
      ${contractNumber ?? null},
      ${type},
      ${JSON.stringify(inputs)}::jsonb,
      ${JSON.stringify(snapshot.results)}::jsonb,
      ${JSON.stringify(snapshot.warnings)}::jsonb,
      ${snapshot.recommendation ? JSON.stringify(snapshot.recommendation) : null}::jsonb,
      ${searchText}
    )
    RETURNING id, name, contract_number, type, inputs, results, warnings, recommendation, saved_at
  `
  return mapCase(rows[0] as DbCaseRow)
}

export async function findCaseForUser(
  userId: string,
  caseId: string,
): Promise<SavedCase | null> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, name, contract_number, type, inputs, results, warnings, recommendation, saved_at
    FROM cases
    WHERE id = ${caseId} AND user_id = ${userId}
  `
  if (rows.length === 0) return null
  return mapCase(rows[0] as DbCaseRow)
}

export async function updateCaseForUser(
  userId: string,
  caseId: string,
  name: string,
  inputs: FreedomInputs | GapInputs,
  snapshot: RecordSnapshotData,
): Promise<SavedCase | null> {
  const sql = getSql()
  const existing = await findCaseForUser(userId, caseId)
  if (!existing) return null
  const searchText = buildSearchText(
    name,
    existing.contractNumber,
    existing.type,
    inputs,
    snapshot.results,
    snapshot.recommendation,
  )
  const rows = await sql`
    UPDATE cases
    SET
      name = ${name},
      inputs = ${JSON.stringify(inputs)}::jsonb,
      results = ${JSON.stringify(snapshot.results)}::jsonb,
      warnings = ${JSON.stringify(snapshot.warnings)}::jsonb,
      recommendation = ${snapshot.recommendation ? JSON.stringify(snapshot.recommendation) : null}::jsonb,
      search_text = ${searchText},
      saved_at = now()
    WHERE id = ${caseId} AND user_id = ${userId}
    RETURNING id, name, contract_number, type, inputs, results, warnings, recommendation, saved_at
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

export async function findApiKeyById(id: string): Promise<PublicApiKey | null> {
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
    WHERE k.id = ${id}
  `
  if (rows.length === 0) return null
  const row = rows[0] as Record<string, string | null>
  return {
    id: row.id as string,
    userId: row.user_id as string,
    userEmail: row.user_email as string,
    name: row.name as string,
    keyPrefix: row.key_prefix as string,
    createdAt: row.created_at as string,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
  }
}

function mapIntegrationConnection(row: DbIntegrationConnection): PublicIntegrationConnection {
  return {
    id: row.id,
    apiKeyId: row.api_key_id,
    productType: row.product_type,
    baseUrl: row.base_url,
    lookupPathTemplate: row.lookup_path_template,
    authType: row.auth_type,
    authConfig: row.auth_config ?? {},
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapIntegrationFieldMapping(row: DbIntegrationFieldMapping): PublicIntegrationFieldMapping {
  return {
    id: row.id,
    connectionId: row.connection_id,
    internalField: row.internal_field,
    externalField: row.external_field,
    enabled: row.enabled,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }
}

export interface IntegrationBundle {
  connection: PublicIntegrationConnection | null
  mappings: PublicIntegrationFieldMapping[]
}

export async function ensureIntegrationConnection(
  apiKeyId: string,
  productType: IntegrationProductType,
): Promise<PublicIntegrationConnection> {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO integration_connections (api_key_id, product_type)
    VALUES (${apiKeyId}, ${productType})
    ON CONFLICT (api_key_id, product_type) DO UPDATE SET updated_at = integration_connections.updated_at
    RETURNING id, api_key_id, product_type, base_url, lookup_path_template, auth_type, auth_config, is_active, created_at, updated_at
  `
  return mapIntegrationConnection(rows[0] as DbIntegrationConnection)
}

export async function getIntegrationConnection(
  apiKeyId: string,
  productType: IntegrationProductType,
): Promise<PublicIntegrationConnection | null> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, api_key_id, product_type, base_url, lookup_path_template, auth_type, auth_config, is_active, created_at, updated_at
    FROM integration_connections
    WHERE api_key_id = ${apiKeyId} AND product_type = ${productType}
  `
  if (rows.length === 0) return null
  return mapIntegrationConnection(rows[0] as DbIntegrationConnection)
}

export async function upsertIntegrationConnection(
  apiKeyId: string,
  productType: IntegrationProductType,
  updates: {
    baseUrl: string
    lookupPathTemplate: string
    authType: IntegrationAuthType
    authConfig: IntegrationAuthConfig
    isActive: boolean
  },
): Promise<PublicIntegrationConnection> {
  const connection = await ensureIntegrationConnection(apiKeyId, productType)
  const sql = getSql()
  const rows = await sql`
    UPDATE integration_connections
    SET
      base_url = ${updates.baseUrl.trim()},
      lookup_path_template = ${updates.lookupPathTemplate.trim()},
      auth_type = ${updates.authType},
      auth_config = ${JSON.stringify(updates.authConfig)}::jsonb,
      is_active = ${updates.isActive},
      updated_at = now()
    WHERE id = ${connection.id}
    RETURNING id, api_key_id, product_type, base_url, lookup_path_template, auth_type, auth_config, is_active, created_at, updated_at
  `
  return mapIntegrationConnection(rows[0] as DbIntegrationConnection)
}

export async function listIntegrationFieldMappings(
  connectionId: string,
): Promise<PublicIntegrationFieldMapping[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, connection_id, internal_field, external_field, enabled, sort_order, created_at
    FROM integration_field_mappings
    WHERE connection_id = ${connectionId}
    ORDER BY sort_order ASC, created_at ASC
  `
  return (rows as DbIntegrationFieldMapping[]).map(mapIntegrationFieldMapping)
}

export async function getIntegrationBundle(
  apiKeyId: string,
  productType: IntegrationProductType,
): Promise<IntegrationBundle | null> {
  const connection = await getIntegrationConnection(apiKeyId, productType)
  if (!connection) return null
  const mappings = await listIntegrationFieldMappings(connection.id)
  return { connection, mappings }
}

export async function ensureDefaultFieldMappings(
  apiKeyId: string,
  productType: IntegrationProductType,
): Promise<PublicIntegrationFieldMapping[]> {
  const connection = await ensureIntegrationConnection(apiKeyId, productType)
  const existing = await listIntegrationFieldMappings(connection.id)
  if (existing.length > 0) return existing

  const sql = getSql()
  const defaults = getDefaultMappings(productType)
  for (const [index, mapping] of defaults.entries()) {
    await sql`
      INSERT INTO integration_field_mappings (connection_id, internal_field, external_field, sort_order)
      VALUES (${connection.id}, ${mapping.internalField}, ${mapping.externalField}, ${index})
      ON CONFLICT (connection_id, internal_field) DO NOTHING
    `
  }

  return listIntegrationFieldMappings(connection.id)
}

export async function createIntegrationFieldMapping(
  apiKeyId: string,
  productType: IntegrationProductType,
  internalField: string,
  externalField: string,
): Promise<PublicIntegrationFieldMapping> {
  const connection = await ensureIntegrationConnection(apiKeyId, productType)
  const sql = getSql()
  const rows = await sql`
    INSERT INTO integration_field_mappings (connection_id, internal_field, external_field, sort_order)
    VALUES (
      ${connection.id},
      ${internalField},
      ${externalField.trim()},
      (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM integration_field_mappings WHERE connection_id = ${connection.id})
    )
    RETURNING id, connection_id, internal_field, external_field, enabled, sort_order, created_at
  `
  return mapIntegrationFieldMapping(rows[0] as DbIntegrationFieldMapping)
}

export async function updateIntegrationFieldMapping(
  apiKeyId: string,
  productType: IntegrationProductType,
  mappingId: string,
  updates: { externalField?: string; enabled?: boolean },
): Promise<PublicIntegrationFieldMapping | null> {
  const connection = await getIntegrationConnection(apiKeyId, productType)
  if (!connection) return null

  const existingRows = await getSql()`
    SELECT id, connection_id, internal_field, external_field, enabled, sort_order, created_at
    FROM integration_field_mappings
    WHERE id = ${mappingId} AND connection_id = ${connection.id}
  `
  const existing = existingRows[0] as DbIntegrationFieldMapping | undefined
  if (!existing) return null

  const externalField = updates.externalField?.trim() ?? existing.external_field
  const enabled = updates.enabled ?? existing.enabled
  const rows = await getSql()`
    UPDATE integration_field_mappings
    SET external_field = ${externalField}, enabled = ${enabled}
    WHERE id = ${mappingId}
    RETURNING id, connection_id, internal_field, external_field, enabled, sort_order, created_at
  `
  return mapIntegrationFieldMapping(rows[0] as DbIntegrationFieldMapping)
}

export async function deleteIntegrationFieldMapping(
  apiKeyId: string,
  productType: IntegrationProductType,
  mappingId: string,
): Promise<boolean> {
  const connection = await getIntegrationConnection(apiKeyId, productType)
  if (!connection) return false

  const rows = await getSql()`
    DELETE FROM integration_field_mappings
    WHERE id = ${mappingId} AND connection_id = ${connection.id}
    RETURNING id
  `
  return rows.length > 0
}