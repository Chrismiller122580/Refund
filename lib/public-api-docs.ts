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

\`\`\`http
Authorization: Bearer rfnd_<your-api-key>
\`\`\`

Or:

\`\`\`http
X-API-Key: rfnd_<your-api-key>
\`\`\`

API keys are tied to a service account. Contact your administrator to request a key. Keys are shown once at creation and cannot be retrieved later.`,
  },
  {
    id: 'calculate',
    title: 'Calculate refunds',
    content: `### VSC (Freedom)

\`POST /api/calculate/freedom\`

### Gap

\`POST /api/calculate/gap\`

Both endpoints require \`Content-Type: application/json\`.

### Required for API key requests

| Field | Type | Description |
|-------|------|-------------|
| \`contractNumber\` | string | Your contract identifier for tracking |
| Calculator fields | object | Dates, costs, mileage, and term data (see field tables below) |

Each API-key calculate request is automatically saved as a tracked record on our side.

### Response

| Field | Description |
|-------|-------------|
| \`contractNumber\` | Echo of the contract you sent |
| \`results\` | Calculated refund breakdown |
| \`warnings\` | Input validation messages |
| \`recommendation\` | VSC only — which refund path to use |
| \`case\` | Saved record \`id\`, \`savedAt\`, and \`contractNumber\` |`,
  },
  {
    id: 'freedom-fields',
    title: 'VSC request fields',
    content: `| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`contractNumber\` | string | Yes | Contract identifier |
| \`startMileage\` | number | Yes* | Odometer at contract start |
| \`endMileage\` | number | Yes* | Odometer at cancellation |
| \`contractTermMiles\` | number | Yes* | Total miles on contract |
| \`contractTermDays\` | number | Yes | Total days on contract |
| \`startDate\` | string | Yes | Effective date (\`YYYY-MM-DD\`) |
| \`endDate\` | string | Yes | Cancellation date (\`YYYY-MM-DD\`) |
| \`cost\` | number | Yes | FW cost ($) |
| \`markup\` | number | Yes | Client markup ($) |
| \`deductible\` | number | Yes | Deductible ($) |
| \`approvedClaimAmount\` | number | Yes | Approved claims ($); use \`0\` if none |
| \`unlimitedMileage\` | boolean | No | Days-only mode; default \`false\` |

*Ignored when \`unlimitedMileage\` is \`true\`.

**Primary result:** \`recommendation.daysTotal\` or \`recommendation.milesTotal\` depending on \`recommendation.recommended\`.`,
  },
  {
    id: 'gap-fields',
    title: 'Gap request fields',
    content: `| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`contractNumber\` | string | Yes | Contract identifier |
| \`contractTermDays\` | number | Yes | Total days on contract |
| \`startDate\` | string | Yes | Effective date (\`YYYY-MM-DD\`) |
| \`endDate\` | string | Yes | Cancellation date (\`YYYY-MM-DD\`) |
| \`fwCost\` | number | Yes | Amount paid to Classic ($) |
| \`retailCost\` | number | Yes | Retail price ($) |
| \`deductible\` | number | Yes | Deductible ($) |
| \`approvedClaimAmount\` | number | Yes | Approved claims ($); use \`0\` if none |

**Primary result:** \`results.refund.totalCustomerReceives\``,
  },
  {
    id: 'example',
    title: 'Example request',
    content: `Replace \`YOUR_API_KEY\` and field values with your contract data.

\`\`\`bash
curl -s -X POST "$BASE_URL/api/calculate/freedom" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
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
\`\`\`

Use your deployment URL as \`BASE_URL\` (for example, the URL shown after you sign in).`,
  },
  {
    id: 'errors',
    title: 'Error handling',
    content: `| Status | Meaning |
|--------|---------|
| \`400\` | Missing \`contractNumber\` or invalid request body |
| \`401\` | Missing or invalid API key |
| \`500\` | Server error — retry with backoff |

Errors return JSON: \`{ "error": "message" }\``,
  },
] as const