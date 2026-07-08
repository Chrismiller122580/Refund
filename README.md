# Refund Calculators

VSC and Gap refund calculators with JWT authentication and server-side calculation API.

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

Open http://localhost:3000 for the landing page. Sign in at `/login` for calculators and API setup at `/app/integration`.

## External integration (push fields)

External systems send contract data; the API calculates and returns refund totals in the same response.

```text
External system  →  POST /api/calculate/{freedom|gap}  →  results + saved case
                   (API key + contractNumber + fields)
```

**Public API docs:** [/docs](http://localhost:3000/docs) (no login required — limited integrator reference)

**After login:** [/app/integration](http://localhost:3000/app/integration) — setup instructions with your deployment URL

### API key calculate example

```bash
curl -s -X POST "$BASE_URL/api/calculate/freedom" \
  -H "Authorization: Bearer rfnd_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contractNumber": "FW-12345",
    "startMileage": 101520,
    "endMileage": 204145,
    "contractTermMiles": 5000,
    "contractTermDays": 1095,
    "startDate": "2024-06-25",
    "endDate": "2025-10-29",
    "cost": 1928,
    "markup": 1050,
    "deductible": 50,
    "approvedClaimAmount": 0
  }'
```

API-key requests require `contractNumber` and auto-save a tracked record. Browser sessions (internal staff) use the same endpoints without `contractNumber` for live calculator updates.

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Email/password login, sets JWT cookie |
| `/api/auth/logout` | POST | Clears session |
| `/api/auth/me` | GET | Current user |
| `/api/calculate/freedom` | POST | VSC refund calculation |
| `/api/calculate/gap` | POST | Gap refund calculation |
| `/api/cases` | GET, POST | List and save refund cases (per user) |
| `/api/cases/:id` | PATCH, DELETE | Update or delete a saved case |
| `/api/integrations/freedom/contracts/{id}` | GET | Pull VSC contract (API key + admin config) |
| `/api/integrations/gap/contracts/{id}` | GET | Pull Gap contract (API key + admin config) |
| `/api/integrations/{type}/contracts/{id}/calculate` | POST | Pull + calculate (optional) |
| `/api/admin/users` | GET, POST | List/create users (admin only) |
| `/api/admin/users/:id` | PATCH | Update user role/status (admin only) |
| `/api/admin/api-keys` | GET, POST | List/create API keys (admin only) |
| `/api/admin/api-keys/:id` | DELETE | Revoke API key (admin only) |
| `/api/admin/api-keys/:id?permanent=true` | DELETE | Permanently delete API key (admin only) |
| `/api/admin/api-keys/:id` | PATCH | Reinstate revoked API key (admin only) |

All `/api/calculate/*`, `/api/cases`, and `/api/admin/*` routes require authentication. External systems should use **API keys**.

## Integration

| Document | Description |
|----------|-------------|
| **[/docs](/docs)** | **Public integrator API reference (limited, no login)** |
| **[docs/COMPANY_INTEGRATION.md](docs/COMPANY_INTEGRATION.md)** | Company integration guide — onboarding, workflows, and field meanings |
| [docs/INTEGRATION.md](docs/INTEGRATION.md) | Connect external systems (API key auth, workflows) |
| [docs/DATA_FIELDS.md](docs/DATA_FIELDS.md) | Complete field dictionary for VSC and Gap |
| [docs/ADMIN.md](docs/ADMIN.md) | Admin API — users, API keys, and contract pull config |
| [docs/examples/](docs/examples/) | Node, Python, and cURL client examples |
| [docs/postman/Refund-API.postman_collection.json](docs/postman/Refund-API.postman_collection.json) | Postman collection |

**Full API reference:** [docs/API.md](docs/API.md)  
**OpenAPI spec:** [docs/openapi.yaml](docs/openapi.yaml)

## Deploy (Vercel)

1. Connect the GitHub repo to Vercel
2. Link a [Neon Postgres](https://vercel.com/marketplace/neon) database to the project
3. Set environment variables: `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (Neon vars are auto-set)
4. Deploy, then run `npm run db:seed` locally (with production env vars) or use Vercel CLI