# Integration Guide

Connect external systems to the Refund Calculators API.

**Base URL:** `https://refund-mocha-psi.vercel.app`  
**Field reference:** [DATA_FIELDS.md](./DATA_FIELDS.md)  
**Admin setup:** [ADMIN.md](./ADMIN.md)  
**OpenAPI:** [openapi.yaml](./openapi.yaml)

---

## Prerequisites

1. A deployed Refund API instance (or local `http://localhost:3000`)
2. An admin account (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from environment)
3. A dedicated **service user** and **API key** for the external system (recommended)

---

## Authentication

### Recommended: API key (server-to-server)

Best for CRM, ERP, backend jobs, and automation platforms.

1. Admin logs in (cookie) or uses an existing admin API key
2. Admin creates a service user: `POST /api/admin/users`
3. Admin creates an API key for that user: `POST /api/admin/api-keys`
4. Store the returned `key` value securely — it is shown **once**
5. Send the key on every request:

```http
Authorization: Bearer rfnd_<your-secret-key>
```

Or:

```http
X-API-Key: rfnd_<your-secret-key>
```

### Alternative: Cookie session (browser or human login)

1. `POST /api/auth/login` with email and password
2. Persist the `Set-Cookie: token=...` header
3. Send `Cookie: token=...` on subsequent requests
4. Session expires after 7 days

---

## Quick start (API key)

```bash
export BASE_URL="https://refund-mocha-psi.vercel.app"
export API_KEY="rfnd_your_key_here"

curl -s -X POST "$BASE_URL/api/calculate/freedom" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "startMileage": 101520,
    "endMileage": 204145,
    "contractTermMiles": 5000,
    "contractTermDays": 1095,
    "startDate": "2024-06-25",
    "endDate": "2025-10-29",
    "cost": 1928,
    "markup": 1050,
    "deductible": 50,
    "approvedClaimAmount": 0,
    "unlimitedMileage": false
  }'
```

Read `recommendation.recommended` and `recommendation.daysTotal` (or `milesTotal`) from the response.

---

## Integration workflows

### 1. Calculate only (stateless)

```
External system → POST /api/calculate/freedom or /api/calculate/gap
               ← results + warnings (+ recommendation for Freedom)
```

Map your CRM fields using [DATA_FIELDS.md](./DATA_FIELDS.md).

### 2. Calculate and save case

```
1. POST /api/calculate/freedom   (validate result)
2. POST /api/cases               (persist inputs + name)
```

### 3. Update existing case

```
1. GET /api/cases?type=freedom   (find case by name or id)
2. POST /api/calculate/freedom   (recalculate with updated inputs)
3. PATCH /api/cases/{id}         (update name + inputs)
```

### 4. Unlimited mileage Freedom product

Set `unlimitedMileage: true`. Mileage fields are ignored. Use only:

- `results.refundPerDays`
- `recommendation.daysTotal`

---

## Interpreting responses

| Situation | Use this field |
|-----------|----------------|
| Freedom — normal product | `recommendation.recommended` picks `miles` or `days` |
| Freedom — unlimited mileage | `recommendation.daysTotal` |
| GAP | `results.refund.totalCustomerReceives` |
| Input validation issue | `warnings[]` where `severity` is `error` |

---

## Error handling

| Status | Action |
|--------|--------|
| `400` | Fix request body (invalid JSON or missing required admin fields) |
| `401` | Re-authenticate or rotate API key |
| `403` | Endpoint requires admin role |
| `404` | Case or user not found |
| `500` | Retry with backoff; check server logs |

---

## Example clients

| File | Language |
|------|----------|
| [examples/refund-api-client.mjs](./examples/refund-api-client.mjs) | Node.js 18+ |
| [examples/refund_api_client.py](./examples/refund_api_client.py) | Python 3 |
| [examples/curl-examples.sh](./examples/curl-examples.sh) | Shell / cURL |
| [postman/Refund-API.postman_collection.json](./postman/Refund-API.postman_collection.json) | Postman |

---

## Limitations

- No webhooks or push notifications
- No OAuth — cookie login or API keys only
- No `GET /api/cases/{id}` — list cases and filter client-side
- API keys inherit the user's role — create **user**-role service accounts, not admin keys
- No explicit rate limits; debounce rapid calculate calls (300ms+ recommended)