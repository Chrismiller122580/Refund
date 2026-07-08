import bcrypt from 'bcryptjs'
import { existsSync, readFileSync } from 'fs'
import { neon } from '@neondatabase/serverless'

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env.example')

function getDatabaseUrl() {
  const url =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED

  if (url) return url

  const user = process.env.POSTGRES_USER
  const password = process.env.POSTGRES_PASSWORD
  const host = process.env.PGHOST
  const database = process.env.POSTGRES_DATABASE || process.env.PGDATABASE

  if (user && password && host && database) {
    return `postgresql://${user}:${encodeURIComponent(password)}@${host}/${database}?sslmode=require`
  }

  throw new Error('Database not configured. Set POSTGRES_URL or Neon env vars.')
}

const configPath = process.env.USERS_SEED_FILE || 'scripts/users.seed.json'
if (!existsSync(configPath)) {
  console.error(`Missing ${configPath}. Copy scripts/users.seed.example.json and edit it.`)
  process.exit(1)
}

const users = JSON.parse(readFileSync(configPath, 'utf8'))
if (!Array.isArray(users) || users.length === 0) {
  console.error(`${configPath} must be a non-empty JSON array.`)
  process.exit(1)
}

const sql = neon(getDatabaseUrl())

for (const entry of users) {
  const email = entry.email?.trim()
  const password = entry.password
  const role = entry.role === 'admin' ? 'admin' : 'user'
  if (!email || !password) {
    console.error('Each user needs email and password:', entry)
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 10)
  await sql`
    INSERT INTO users (email, password, role, is_active)
    VALUES (${email.toLowerCase()}, ${hash}, ${role}, true)
    ON CONFLICT (email) DO UPDATE SET
      password = EXCLUDED.password,
      role = EXCLUDED.role,
      is_active = true
  `
  console.log(`Created/updated ${role} user: ${email}`)
}