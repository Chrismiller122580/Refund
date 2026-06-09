import { neon } from '@neondatabase/serverless'

export function getDatabaseUrl(): string {
  const url =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
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

  throw new Error(
    'Database not configured. Link Neon to this Vercel project or set POSTGRES_URL.',
  )
}

export function getSql() {
  return neon(getDatabaseUrl())
}
