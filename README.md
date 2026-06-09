# Refund Calculators

Freedom and GAP warranty refund calculators with JWT authentication and server-side calculation API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) database and copy the connection string.

3. Copy `.env.example` to `.env.local` and set:
   - `DATABASE_URL` — Postgres connection string
   - `JWT_SECRET` — random 32+ character secret
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — initial login user

4. Seed the admin user:
   ```bash
   npm run db:seed
   ```

5. Run locally:
   ```bash
   npm run dev
   ```

Open http://localhost:3000 — you will be redirected to `/login`.

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Email/password login, sets JWT cookie |
| `/api/auth/logout` | POST | Clears session |
| `/api/auth/me` | GET | Current user |
| `/api/calculate/freedom` | POST | Freedom refund calculation |
| `/api/calculate/gap` | POST | GAP refund calculation |

All `/api/calculate/*` routes require authentication.

## Deploy (Vercel)

1. Connect the GitHub repo to Vercel
2. Add a Vercel Postgres database to the project
3. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
4. Deploy, then run `npm run db:seed` locally (with production env vars) or use Vercel CLI
