import { sql } from '@vercel/postgres'

export interface DbUser {
  id: string
  email: string
  password: string
  created_at: string
}

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `
}

export async function findUserByEmail(email: string): Promise<DbUser | undefined> {
  const { rows } = await sql<DbUser>`SELECT id, email, password, created_at FROM users WHERE email = ${email}`
  return rows[0]
}

export async function createUser(email: string, passwordHash: string) {
  const { rows } = await sql`INSERT INTO users (email, password) VALUES (${email}, ${passwordHash}) RETURNING id, email, created_at`
  return rows[0]
}
