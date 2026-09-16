export const PUBLIC_API_SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    content: `The Refund Calculators API lets external systems request VSC and Gap refund calculations. Your system sends contract data; the API returns calculated refund totals in the same response.

This documentation covers integrator-facing endpoints only. Admin setup, internal configuration, and contract-pull integrations require a signed-in account.`,
  },
  {
    id: 'authentication',
    title: 'Authentication',
    content: `Server-to-server integrations use an API key issued by your administrator.

Send the key on every request using one of these headers:

Authorization: Bearer rfnd_<your-api-key>

Or:

X-API-Key: rfnd_<your-api-key>

API keys are tied to a service account. Contact your administrator to request a key. Keys are shown once at creation and cannot be retrieved later.`,
  },
  {
    id: 'calculate',
    title: 'Calculate refunds',
    content: `VSC (Freedom): POST /api/calculate/freedom

Gap: POST /api/calculate/gap

Both endpoints require Content-Type: application/json.

Required for API key requests: contractNumber plus the calculator fields in the tables below.

Each API-key calculate request is automatically saved as a tracked record.

Response fields: contractNumber, results, warnings, recommendation (VSC only), case.`,
  },
  {
    id: 'freedom-fields',
    title: 'VSC request fields',
    content: `| Field | Type | Required | Description |
|-------|------|----------|-------------|
| contractNumber | string | Yes | Contract identifier |
| startMileage | number | Yes* | Odometer at contract start |
| endMileage | number | Yes* | Odometer at cancellation |
| contractTermMiles | number | Yes* | Total miles on contract |
| contractTermDays | number | Yes | Total days on contract |
| startDate | string | Yes | Effective date (YYYY-MM-DD) |
| endDate | string | Yes | Cancellation date (YYYY-MM-DD) |
| cost | number | Yes | FW cost ($) |
| markup | number | Yes | Client markup ($) |
| deductible | number | Yes | Deductible ($) |
| approvedClaimAmount | number | Yes | Approved claims ($); use 0 if none |
| unlimitedMileage | boolean | No | Days-only mode; default false |
| agentId | string | No | Agent or agency ID |
| agentName | string | No | Agent or producer name |
| agentPercent | number | No | Agent commission percent points (10 = 10%) |

*Ignored when unlimitedMileage is true.`,
  },
  {
    id: 'vsc-results',
    title: 'VSC client refund amount',
    content: `Yes — the VSC client refund amount is in the calculate response.

Field name: clientRefundToCustomer
Meaning: amount the dealer/client refunds to the customer (markup side).

VSC returns two paths. Read recommendation.recommended first, then pick the matching path:

| recommendation.recommended | Client refund amount |
|----------------------------|----------------------|
| days | results.refundPerDays.clientRefundToCustomer |
| miles | results.refundPerMiles.clientRefundToCustomer |
| equivalent | either path (they match) |

Other amounts on the same object:
- amountSentToClient — what Freedom sends the dealer
- totalCustomerReceives — client refund + amount sent to client (customer-facing total)
- agentChargeback — prorated agent commission chargeback

Unlimited mileage products: use the days path only (results.refundPerDays).`,
  },
  {
    id: 'gap-fields',
    title: 'Gap request and refund fields',
    content: `| Field | Type | Required | Description |
|-------|------|----------|-------------|
| contractNumber | string | Yes | Contract identifier |
| contractTermDays | number | Yes | Total days on contract |
| startDate | string | Yes | Effective date (YYYY-MM-DD) |
| endDate | string | Yes | Cancellation date (YYYY-MM-DD) |
| fwCost | number | Yes | Amount paid to Classic ($) |
| retailCost | number | Yes | Retail price ($) |
| deductible | number | Yes | Deductible ($) |
| approvedClaimAmount | number | Yes | Approved claims ($); use 0 if none |

Gap client refund amount: results.refund.clientRefundToCustomer
Customer-facing total: results.refund.totalCustomerReceives
Amount sent to dealer: results.refund.amountSentToClient`,
  },
  {
    id: 'example',
    title: 'Example request',
    content: `Replace YOUR_API_KEY and field values with your contract data.

curl -s -X POST "$BASE_URL/api/calculate/freedom" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"contractNumber":"FW-12345","startMileage":101520,"endMileage":204145,"contractTermMiles":5000,"contractTermDays":1095,"startDate":"2024-06-25","endDate":"2025-10-29","cost":1928,"markup":1050,"deductible":50,"approvedClaimAmount":0}'

Use your deployment URL as BASE_URL (for example, the URL shown after you sign in).`,
  },
  {
    id: 'errors',
    title: 'Error handling',
    content: `| Status | Meaning |
|--------|---------|
| 400 | Missing contractNumber or invalid request body |
| 401 | Missing or invalid API key |
| 500 | Server error — retry with backoff |

Errors return JSON: { "error": "message", "hint": "how to fix it" }

### Invalid JSON body

This means the HTTP body failed to parse as JSON. It is not a field-validation error.

Fix:
- Send header Content-Type: application/json
- Use raw JSON (Postman/Insomnia: Body → raw → JSON), not form fields
- Use double quotes on keys and strings; no trailing commas
- Do not send an empty body
- Include contractNumber on API-key calculate calls`,
  },
] as const
