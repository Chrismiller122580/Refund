# Refund Calculators API

**Version:** 1.0  
**Base URL:** `https://refund-mocha-psi.vercel.app`  
**Content-Type:** `application/json`

Formal API reference for integrating with the Freedom and GAP warranty refund calculators.

**Integration guide:** [INTEGRATION.md](./INTEGRATION.md)  
**Data fields:** [DATA_FIELDS.md](./DATA_FIELDS.md)  
**Admin API:** [ADMIN.md](./ADMIN.md)

---

## Overview

The Refund Calculators API provides:

- **Authentication** — cookie session (browser) or API key (server-to-server)
- **Calculations** — server-side Freedom and GAP refund math (matches the Excel workbook)
- **Saved cases** — per-user persistence of calculator inputs in Postgres
- **Admin** — user and API key management for external integrations

All endpoints except `POST /api/auth/login` require a valid session cookie or API key.

---

## Authentication

### Session model

Authentication uses a **JWT stored in an httpOnly cookie** named `token`.

| Property | Value |
|----------|-------|
| Cookie name | `token` |
| Lifetime | 7 days |
| Flags | `httpOnly`, `SameSite=Lax`, `Secure` (production) |

### API key (recommended for external systems)

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer rfnd_<secret>` |
| `X-API-Key` | `rfnd_<secret>` (alternative) |

API keys are created by an admin via `POST /api/admin/api-keys`. See [ADMIN.md](./ADMIN.md).

### Login flow for API clients

1. `POST /api/auth/login` with email and password.
2. Store the `Set-Cookie` header (`token=...`) from the response.
3. Send that cookie on all subsequent requests.
4. Call `POST /api/auth/logout` or allow the cookie to expire to end the session.

### Example (cURL)

```bash
# Login and save cookie
curl -c cookies.txt -X POST https://refund-mocha-psi.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

# Authenticated request
curl -b cookies.txt -X POST https://refund-mocha-psi.vercel.app/api/calculate/freedom \
  -H "Content-Type: application/json" \
  -d '{"startMileage":101520,"endMileage":204145,"contractTermMiles":5000,"contractTermDays":1095,"startDate":"2024-06-25","endDate":"2025-10-29","cost":1928,"markup":1050,"deductible":50,"approvedClaimAmount":0,"unlimitedMileage":false}'
```

### Example (JavaScript fetch)

```javascript
// Login
const loginRes = await fetch('https://refund-mocha-psi.vercel.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'admin@example.com', password: 'your-password' }),
})

// Calculate (cookie sent automatically in browser)
const calcRes = await fetch('https://refund-mocha-psi.vercel.app/api/calculate/freedom', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ /* FreedomInputs */ }),
})
const data = await calcRes.json()
```

---

## Error responses

All errors return JSON:

```json
{
  "error": "Human-readable message"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| `400` | Invalid request body or parameters |
| `401` | Missing or invalid session |
| `404` | Resource not found |
| `500` | Server error |

---

## Endpoints

### Authentication

#### `POST /api/auth/login`

Sign in and receive a session cookie.

**Auth required:** No

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User email |
| `password` | string | Yes | User password |

**Response `200`:**

```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response `401`:** Invalid credentials

---

#### `POST /api/auth/logout`

End the current session.

**Auth required:** Yes

**Response `200`:**

```json
{
  "ok": true
}
```

---

#### `GET /api/auth/me`

Return the currently authenticated user.

**Auth required:** Yes

**Response `200`:**

```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### Admin (admin role required)

See [ADMIN.md](./ADMIN.md) for full setup workflow.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users` | GET | List users |
| `/api/admin/users` | POST | Create user |
| `/api/admin/users/{id}` | PATCH | Update role, status, or password |
| `/api/admin/api-keys` | GET | List API keys |
| `/api/admin/api-keys` | POST | Create API key (secret returned once) |
| `/api/admin/api-keys/{id}` | DELETE | Revoke API key |
| `/api/admin/api-keys/{id}?permanent=true` | DELETE | Permanently delete API key |
| `/api/admin/api-keys/{id}` | PATCH | Reinstate revoked API key (`{ "action": "reinstate" }`) |

---

### Calculations

#### `POST /api/calculate/freedom`

Calculate Freedom warranty refunds using mileage-based and days-based paths.

**Auth required:** Yes

**Request body — `FreedomInputs`:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startMileage` | number | Yes | Odometer at contract start |
| `endMileage` | number | Yes | Odometer at cancellation |
| `contractTermMiles` | number | Yes | Total miles allowed by contract |
| `contractTermDays` | number | Yes | Total days in contract term |
| `startDate` | string | Yes | Contract start date (`YYYY-MM-DD`) |
| `endDate` | string | Yes | Cancellation date (`YYYY-MM-DD`) |
| `cost` | number | Yes | FW cost ($) |
| `markup` | number | Yes | Client mark up ($) |
| `deductible` | number | Yes | Deductible amount ($) |
| `approvedClaimAmount` | number | Yes | Approved claim amount ($) |
| `unlimitedMileage` | boolean | No | When `true`, only the days-based path is used (defaults to `false`) |

**Response `200`:**

```json
{
  "results": {
    "mileCap": 106520,
    "milesDriven": 102625,
    "daysUsed": 491,
    "miles": {
      "mileagePerDay": 4.566,
      "daysPerDiem": 1.761,
      "costPerMile": 0.386,
      "ourPercent": 20.525,
      "fwProratedProfit": 39572.2,
      "clientProratedProfit": 21551.25
    },
    "days": {
      "mileagePerDay": 4.566,
      "daysPerDiem": 1.761,
      "costPerMile": 0,
      "ourPercent": 0.448,
      "fwProratedProfit": 864.52,
      "clientProratedProfit": 470.82
    },
    "refundPerMiles": {
      "amountSentToClient": -37694.2,
      "clientRefundToCustomer": -20501.25,
      "totalCustomerReceives": -58195.45
    },
    "refundPerDays": {
      "amountSentToClient": 1013.48,
      "clientRefundToCustomer": 579.18,
      "totalCustomerReceives": 1592.66
    }
  },
  "warnings": [
    {
      "id": "mile-cap-exceeded",
      "severity": "warning",
      "message": "End mileage (204,145) exceeds the mile cap (106,520).",
      "field": "endMileage"
    }
  ],
  "recommendation": {
    "recommended": "days",
    "milesTotal": -58195.45,
    "daysTotal": 1592.66,
    "difference": 59788.11,
    "milesDisqualified": true,
    "milesDisqualifyReason": "End mileage (204,145) exceeds the mile cap (106,520).",
    "message": "Use the days-based path. The mileage path is invalid: ..."
  }
}
```

**Warning severity values:** `error` | `warning` | `info`

**Recommendation `recommended` values:** `miles` | `days` | `equivalent`

---

#### `POST /api/calculate/gap`

Calculate GAP warranty refunds (days-based only).

**Auth required:** Yes

**Request body — `GapInputs`:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contractTermDays` | number | Yes | Total days in contract term |
| `startDate` | string | Yes | Contract start date (`YYYY-MM-DD`) |
| `endDate` | string | Yes | Cancellation date (`YYYY-MM-DD`) |
| `fwCost` | number | Yes | Amount FW pays to Classic ($) |
| `retailCost` | number | Yes | Retail cost in FW ($) |
| `deductible` | number | Yes | Deductible from Classic refund sheet ($) |
| `approvedClaimAmount` | number | Yes | Approved claim amount ($) |

**Response `200`:**

```json
{
  "results": {
    "daysUsed": 1091,
    "prorated": {
      "daysPerDiem": 0.056,
      "ourPercent": 0.598,
      "fwProratedProfit": 61.57,
      "clientProratedProfit": 511.13
    },
    "refund": {
      "amountSentToClient": -8.57,
      "clientRefundToCustomer": 343.87,
      "totalCustomerReceives": 335.30
    }
  },
  "warnings": []
}
```

---

### Saved cases

Cases are scoped to the authenticated user. Each user only sees their own cases.

#### `GET /api/cases?type={freedom|gap}`

List saved cases for the current user.

**Auth required:** Yes

**Query parameters:**

| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| `type` | string | Yes | `freedom` or `gap` |

**Response `200`:**

```json
{
  "cases": [
    {
      "id": "uuid",
      "name": "Customer ABC",
      "type": "freedom",
      "inputs": { /* FreedomInputs or GapInputs */ },
      "savedAt": "2026-06-09T18:00:00.000Z"
    }
  ]
}
```

Cases are ordered by `savedAt` descending (newest first).

---

#### `POST /api/cases`

Save a new case.

**Auth required:** Yes

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name for the case |
| `type` | string | Yes | `freedom` or `gap` |
| `inputs` | object | Yes | `FreedomInputs` or `GapInputs` |

**Response `200`:**

```json
{
  "case": {
    "id": "uuid",
    "name": "Customer ABC",
    "type": "freedom",
    "inputs": { /* ... */ },
    "savedAt": "2026-06-09T18:00:00.000Z"
  }
}
```

---

#### `PATCH /api/cases/{id}`

Update a saved case owned by the current user (name and inputs).

**Auth required:** Yes

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name for the case |
| `inputs` | object | Yes | `FreedomInputs` or `GapInputs` |

**Response `200`:**

```json
{
  "case": {
    "id": "uuid",
    "name": "Customer ABC (updated)",
    "type": "freedom",
    "inputs": { /* ... */ },
    "savedAt": "2026-06-09T18:30:00.000Z"
  }
}
```

**Response `404`:** Case not found or not owned by user

---

#### `DELETE /api/cases/{id}`

Delete a saved case owned by the current user.

**Auth required:** Yes

**Path parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Case UUID |

**Response `200`:**

```json
{
  "ok": true
}
```

**Response `404`:** Case not found or not owned by user

---

## Reference: contract terms

When selecting a contract term in the web UI, these values auto-fill miles and days:

| Term | Miles | Days |
|------|-------|------|
| 3 Months | 3,000 | 90 |
| 6 Months | 6,000 | 180 |
| 12 Months | 15,000 | 365 |
| 24 Months | 30,000 | 730 |
| 36 Months | 50,000 | 1,095 |
| 48 Months | 70,000 | 1,460 |
| 60 Months | 100,000 | 1,825 |
| 72 Months | 100,000 | 2,190 |
| 84 Months | 100,000 | 2,555 |

GAP uses days only from this table.

---

## Rate limits

No explicit rate limits are configured. Use reasonable request pacing (the web UI debounces calculations by 300ms).

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.2 | 2026-07-07 | API keys, admin role, user management, integration docs |
| 1.1 | 2026-07-07 | PATCH cases, unlimited mileage, input normalization |
| 1.0 | 2026-06-09 | Initial API: auth, Freedom/GAP calculate, cases CRUD |

---

## Support

- **Repository:** [github.com/Chrismiller122580/Refund](https://github.com/Chrismiller122580/Refund)
- **OpenAPI spec:** [openapi.yaml](./openapi.yaml)