# Company Integration Guide

How external systems (CRM, DMS, dealer portals, back-office tools) connect to the Refund Calculators API to run Freedom and GAP warranty refund calculations.

**Production base URL:** `https://refund-mocha-psi.vercel.app`

---

## Who this guide is for

- **Your IT / integration team** — wiring up API calls
- **Freedom Warranty admins** — provisioning service accounts and API keys
- **Business stakeholders** — understanding which contract data is needed and what comes back

---

## Overview

The Refund API supports two integration patterns:

| Pattern | When to use | Your system provides |
|---------|-------------|----------------------|
| **Push fields** | You already have contract data in your system | JSON with calculator input fields |
| **Pull by contract number** | Freedom admin configured an external contract API | A Freedom or GAP contract number only |

Both patterns return the same calculation results. Freedom and GAP use **different contract numbers** and **different input fields**, but several fields (dates, deductible, claims) are shared.

```text
┌─────────────────┐     API key auth      ┌──────────────────────┐
│  Your system    │ ────────────────────► │  Refund Calculators  │
│  (CRM / DMS)    │ ◄──────────────────── │  API                 │
└─────────────────┘   results + warnings  └──────────────────────┘
```

---

## Step 1 — Get access (admin setup)

A Freedom Warranty administrator must complete this once per integrating company.

1. **Create a service user** (role: `user`, not `admin`)
   - Example: `integration@yourcompany.com`
   - Created in **Admin → Users** or via `POST /api/admin/users`

2. **Create an API key** for that user
   - Created in **Admin → API keys** or via `POST /api/admin/api-keys`
   - The full key (`rfnd_...`) is shown **once** — store it in your secrets manager

3. **Credentials are emailed automatically** to the service user's email when an admin creates the key (requires Resend to be configured on the server)
   - The email includes the full API key, base URL, and authentication instructions
   - Store the key in your secrets manager — it cannot be retrieved again

4. **Share credentials securely** with your integration team if needed
   - Never use the admin password for automated integrations
   - Rotate keys when staff change or systems are decommissioned

### Authentication header

Send the API key on every request:

```http
Authorization: Bearer rfnd_<your-secret-key>
```

Alternative:

```http
X-API-Key: rfnd_<your-secret-key>
```

---

## Step 2 — Choose your integration path

### Option A — Push contract data (most common)

Your system maps its fields to the calculator JSON and calls the calculate endpoint directly.

**Freedom:**

```bash
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

**GAP:**

```bash
curl -s -X POST "$BASE_URL/api/calculate/gap" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contractTermDays": 1095,
    "startDate": "2024-06-25",
    "endDate": "2025-10-29",
    "fwCost": 450,
    "retailCost": 895,
    "deductible": 50,
    "approvedClaimAmount": 0
  }'
```

### Option B — Pull by contract number

If Freedom admin configured **Admin → Integrations** with your contract system's API, you can pass only a contract number. The Refund API fetches the contract, maps fields, and returns normalized inputs.

| Product | Endpoint |
|---------|----------|
| Freedom | `GET /api/integrations/freedom/contracts/{contractNumber}` |
| GAP | `GET /api/integrations/gap/contracts/{contractNumber}` |

**Pull and calculate in one call:**

```bash
curl -s -X POST "$BASE_URL/api/integrations/gap/contracts/GAP-12345/calculate" \
  -H "Authorization: Bearer $API_KEY"
```

The pull response includes:

| Field | Meaning |
|-------|---------|
| `inputs` | Normalized calculator fields ready to use |
| `mappedFields` | Which fields were successfully mapped from your contract API |
| `missingRequired` | Required calculator fields that could not be mapped — your admin may need to adjust field mappings |

Field mappings are configured by your Freedom admin. External field names (e.g. `ContractEffectiveDate` or `vehicle.odometerStart`) are mapped to calculator field names (e.g. `startDate`, `startMileage`).

---

## Step 3 — Read the results

### Freedom — which total to use

Freedom calculates **two refund paths** (mileage-based and days-based) and recommends the better one.

| Response field | What it means |
|----------------|---------------|
| `recommendation.recommended` | `"miles"`, `"days"`, or `"equivalent"` — which path to use |
| `recommendation.daysTotal` | Customer total on the days path |
| `recommendation.milesTotal` | Customer total on the mileage path |
| `recommendation.message` | Plain-language explanation for advisors |
| `results.refundPerDays.totalCustomerReceives` | Days-path customer refund |
| `results.refundPerMiles.totalCustomerReceives` | Miles-path customer refund |
| `warnings[]` | Input issues (`error`, `warning`, or `info`) |

**Unlimited mileage products:** set `unlimitedMileage: true` and use only `recommendation.daysTotal` / `results.refundPerDays`.

### GAP — which total to use

| Response field | What it means |
|----------------|---------------|
| `results.refund.totalCustomerReceives` | **Primary customer-facing refund total** |
| `results.refund.amountSentToClient` | Amount Freedom sends to the dealer/client |
| `results.refund.clientRefundToCustomer` | Amount the client refunds to the customer |
| `results.daysUsed` | Days between contract start and cancellation |
| `warnings[]` | Input validation issues |

---

## Step 4 — Save cases (optional)

To persist a calculation for later review:

```bash
# 1. Calculate first (validate the result)
# 2. Save
curl -s -X POST "$BASE_URL/api/cases" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contract FW-12345",
    "type": "freedom",
    "inputs": { ... }
  }'
```

Saved cases store inputs plus the computed snapshot (results, warnings, recommendation). List cases with `GET /api/cases?type=freedom` or `GET /api/cases?type=gap`.

---

## Field reference — what each field is for

### Shared fields (Freedom and GAP)

These describe the contract timeline and adjustments that apply to both products.

| Field | Type | What it is | Typical source in your system |
|-------|------|------------|-------------------------------|
| `contractTermDays` | number | Total contract length in days | Contract term table or product config |
| `startDate` | string (`YYYY-MM-DD`) | Date the warranty contract became effective | Contract effective / sale date |
| `endDate` | string (`YYYY-MM-DD`) | Date of cancellation or refund request | Cancellation date |
| `deductible` | number ($) | Contract deductible applied to the refund | Contract terms or refund worksheet |
| `approvedClaimAmount` | number ($) | Total paid or approved claims against the contract | Claims system; use `0` if none |

---

### Freedom-only fields

Freedom refunds can be calculated by **mileage used** or **days used**. Your system should supply mileage data unless the product is unlimited mileage.

| Field | Type | What it is | Typical source in your system |
|-------|------|------------|-------------------------------|
| `startMileage` | number | Odometer reading at contract start | DMS / sale odometer |
| `endMileage` | number | Odometer at cancellation | Current odometer or cancellation reading |
| `contractTermMiles` | number | Total miles allowed on the contract | Product term (e.g. 36 mo = 50,000 mi) |
| `cost` | number ($) | Freedom Warranty cost on the contract (FW portion) | Contract pricing / cost field |
| `markup` | number ($) | Dealer or client markup on the contract | Contract pricing |
| `unlimitedMileage` | boolean | `true` if the product has no mileage cap (days-only refund) | Product type flag; default `false` |

**Mileage fields** (`startMileage`, `endMileage`, `contractTermMiles`) are ignored when `unlimitedMileage` is `true`.

#### Freedom response breakdown

Each refund path (`refundPerMiles`, `refundPerDays`) contains:

| Field | What it is |
|-------|------------|
| `amountSentToClient` | Dollars Freedom sends to the dealer/client |
| `clientRefundToCustomer` | Dollars the client refunds to the end customer |
| `totalCustomerReceives` | Sum of the above — **the customer-facing refund** |

---

### GAP-only fields

GAP uses days-based proration only. Cost fields differ from Freedom naming.

| Field | Type | What it is | Typical source in your system |
|-------|------|------------|-------------------------------|
| `fwCost` | number ($) | Amount Freedom pays to Classic (wholesale cost) | GAP contract cost / Classic sheet |
| `retailCost` | number ($) | Retail price charged on the Freedom contract | Contract retail / customer price |

> **Note:** Freedom uses `cost` + `markup`. GAP uses `fwCost` + `retailCost`. Map your system's pricing fields accordingly.

---

## Contract term lookup table

If your system stores a **term label** instead of raw miles/days, convert using this table before calling the API.

| Term label | Miles (Freedom) | Days (Freedom & GAP) |
|------------|-----------------|----------------------|
| 3 Months | 3,000 | 90 |
| 6 Months | 6,000 | 180 |
| 12 Months | 15,000 | 365 |
| 24 Months | 30,000 | 730 |
| 36 Months | 50,000 | 1,095 |
| 48 Months | 70,000 | 1,460 |
| 60 Months | 100,000 | 1,825 |
| 72 Months | 100,000 | 2,190 |
| 84 Months | 100,000 | 2,555 |

GAP integrations need **days only** from this table.

---

## Recommended workflows

### Workflow 1 — Quote / estimate (no save)

```text
Your CRM → POST /api/calculate/{freedom|gap} → display total to agent
```

### Workflow 2 — Contract number lookup

```text
Agent enters contract # → GET /api/integrations/{type}/contracts/{number}
                      → POST .../calculate (or calculate locally from inputs)
                      → display total
```

### Workflow 3 — Calculate and archive

```text
POST /api/calculate/{type} → POST /api/cases → optional email notification to Freedom staff
```

### Workflow 4 — Update an existing case

```text
GET /api/cases?type=freedom&q=FW-12345 → PATCH /api/cases/{id} with updated inputs
```

---

## Error handling

| HTTP status | Meaning | Action |
|-------------|---------|--------|
| `400` | Invalid JSON or missing required fields | Fix request body; check `missingRequired` on pull endpoints |
| `401` | Invalid or revoked API key | Rotate key with Freedom admin |
| `403` | Endpoint requires admin role | Use a `user`-role service key, not admin |
| `404` | Case or contract not found | Verify contract number and product type (Freedom vs GAP) |
| `502` | External contract API failed (pull only) | Retry; check integration config with Freedom admin |
| `503` | Integration not configured or inactive | Contact Freedom admin to enable **Admin → Integrations** |
| `500` | Server error | Retry with backoff |

---

## Security checklist

- [ ] Use a dedicated **service user** per integrating company (role: `user`)
- [ ] Store API keys in a secrets manager, not source code
- [ ] Use HTTPS only (`https://refund-mocha-psi.vercel.app`)
- [ ] Revoke keys when integrations are retired
- [ ] Do not share admin credentials with external systems
- [ ] Debounce rapid calculate calls (300ms+ between requests)

---

## Example code and tools

| Resource | Location |
|----------|----------|
| Node.js client | [docs/examples/refund-api-client.mjs](./examples/refund-api-client.mjs) |
| Python client | [docs/examples/refund_api_client.py](./examples/refund_api_client.py) |
| cURL examples | [docs/examples/curl-examples.sh](./examples/curl-examples.sh) |
| Postman collection | [docs/postman/Refund-API.postman_collection.json](./postman/Refund-API.postman_collection.json) |
| Full API reference | [docs/API.md](./API.md) |
| OpenAPI spec | [docs/openapi.yaml](./openapi.yaml) |
| Admin setup (keys, integrations) | [docs/ADMIN.md](./ADMIN.md) |

---

## Support contacts

| Need | Contact |
|------|---------|
| API key or service user | Freedom Warranty administrator |
| Contract pull / field mapping | Freedom admin → **Admin → Integrations** |
| Field mapping questions | Reference this guide + [DATA_FIELDS.md](./DATA_FIELDS.md) |
| Technical API details | [docs/API.md](./API.md) and [docs/INTEGRATION.md](./INTEGRATION.md) |

---

## Quick reference — endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/calculate/freedom` | POST | API key | Calculate Freedom refund |
| `/api/calculate/gap` | POST | API key | Calculate GAP refund |
| `/api/integrations/freedom/contracts/{id}` | GET | API key | Pull Freedom contract by number |
| `/api/integrations/gap/contracts/{id}` | GET | API key | Pull GAP contract by number |
| `/api/integrations/{type}/contracts/{id}/calculate` | POST | API key | Pull + calculate |
| `/api/cases` | GET, POST | API key | List / save cases |
| `/api/cases/{id}` | PATCH, DELETE | API key | Update / delete a case |