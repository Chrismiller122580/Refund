# Refund Calculators

Freedom and GAP warranty refund calculators with JWT authentication and server-side calculation API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Link a [Neon Postgres](https://vercel.com/marketplace/neon) database to the Vercel project (sets `POSTGRES_URL` automatically).

3. Copy `.env.example` to `.env.local` and set:
   - `POSTGRES_URL` — set automatically by Neon (or use individual `PGHOST`, `POSTGRES_USER`, etc.)
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

Open http://localhost:3000 for the landing page. Sign in at `/login` to access calculators at `/app`.

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Email/password login, sets JWT cookie |
| `/api/auth/logout` | POST | Clears session |
| `/api/auth/me` | GET | Current user |
| `/api/calculate/freedom` | POST | Freedom refund calculation |
| `/api/calculate/gap` | POST | GAP refund calculation |
| `/api/cases` | GET, POST | List and save refund cases (per user) |
| `/api/cases/:id` | PATCH, DELETE | Update or delete a saved case |

All `/api/calculate/*` and `/api/cases` routes require authentication. Saved cases are stored per user in Postgres.

**Full API documentation:** [docs/API.md](docs/API.md)  
**OpenAPI spec:** [docs/openapi.yaml](docs/openapi.yaml)

## Deploy (Vercel)

1. Connect the GitHub repo to Vercel
2. Link a [Neon Postgres](https://vercel.com/marketplace/neon) database to the project
3. Set environment variables: `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (Neon vars are auto-set)
4. Deploy, then run `npm run db:seed` locally (with production env vars) or use Vercel CLI
