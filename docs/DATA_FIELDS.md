# Data Fields Reference

Field dictionary for integrating external systems with the Refund Calculators API.

**Related docs:** [INTEGRATION.md](./INTEGRATION.md) | [API.md](./API.md) | [ADMIN.md](./ADMIN.md)

---

## VSC calculator — request (`FreedomInputs`, route `freedom`)

| Field | Type | Required | External source (typical) | Notes |
|-------|------|----------|---------------------------|-------|
| `contractNumber` | string | Yes (API key) | Your contract / policy ID | Required for API-key requests; auto-saves a tracked record |
| `startMileage` | number | Yes* | DMS / contract start odometer | Ignored when `unlimitedMileage: true` |
| `endMileage` | number | Yes* | Cancellation odometer | Ignored when unlimited |
| `contractTermMiles` | number | Yes* | Contract mileage allowance | Ignored when unlimited |
| `contractTermDays` | number | Yes | Contract term length | Always required |
| `startDate` | string | Yes | Contract effective date | Format `YYYY-MM-DD` |
| `endDate` | string | Yes | Cancellation date | Format `YYYY-MM-DD` |
| `cost` | number | Yes | FW cost on contract | Dollars |
| `markup` | number | Yes | Dealer/client markup | Dollars |
| `deductible` | number | Yes | Contract deductible | Dollars |
| `approvedClaimAmount` | number | Yes | Paid or approved claims | Dollars; use `0` if none |
| `unlimitedMileage` | boolean | No | Product type flag | Default `false`; days-only mode |
| `agentId` | string | No | Agent / agency ID | Optional; stable identifier for chargeback tracking |
| `agentName` | string | No | Agent / producer name | Optional; for chargeback tracking |
| `agentPercent` | number | No | Agent commission rate | Percent points (e.g. `10` = 10%) |

\* Not required for calculation when `unlimitedMileage` is `true`, but may be omitted or zeroed.

### Freedom — response (`results`)

| Field | Type | Description |
|-------|------|-------------|
| `mileCap` | number | `startMileage + contractTermMiles` (0 when unlimited) |
| `milesDriven` | number | `endMileage - startMileage` (0 when unlimited) |
| `daysUsed` | number | Days between start and end dates |
| `miles` | object | Mileage-based proration breakdown |
| `days` | object | Days-based proration breakdown |
| `refundPerMiles` | object | Refund totals using mileage path |
| `refundPerDays` | object | Refund totals using days path |
| `agentOriginalCommission` | number | Full agent commission = `cost × agentPercent / 100` |

### Freedom — refund breakdown (each path)

| Field | Type | Description |
|-------|------|-------------|
| `amountSentToClient` | number | Amount FW sends to the dealer |
| `clientRefundToCustomer` | number | **Client refund amount** — what the dealer/client refunds to the customer |
| `totalCustomerReceives` | number | Sum of the two — primary customer-facing total |
| `agentChargeback` | number | Pro-rated agent chargeback = `cost × (agentPercent/100) × (1 − ourPercent)` |

**Client refund amount (VSC):** read `recommendation.recommended`, then use `results.refundPerDays.clientRefundToCustomer` when it is `days`, or `results.refundPerMiles.clientRefundToCustomer` when it is `miles`. If `equivalent`, either path is fine.

### Freedom — recommendation

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `recommended` | string | `miles`, `days`, `equivalent` | Which path to use |
| `milesTotal` | number | | Total on mileage path |
| `daysTotal` | number | | Total on days path |
| `difference` | number | | Absolute difference between paths |
| `milesDisqualified` | boolean | | Mileage path invalid or unlimited product |
| `milesDisqualifyReason` | string | | Why mileage path was disqualified |
| `message` | string | | Human-readable advisor message |

**Integration tip:** When `unlimitedMileage: true`, use `recommendation.daysTotal` and `results.refundPerDays`.

### Freedom — warnings

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable warning code (e.g. `mile-cap-exceeded`) |
| `severity` | string | `error`, `warning`, or `info` |
| `message` | string | Human-readable text |
| `field` | string | Optional input field name |

---

## Gap calculator — request (`GapInputs`, route `gap`)

| Field | Type | Required | External source (typical) |
|-------|------|----------|---------------------------|
| `contractNumber` | string | Yes (API key) | Your contract / policy ID |
| `contractTermDays` | number | Yes | Contract term |
| `startDate` | string | Yes | Contract effective date (`YYYY-MM-DD`) |
| `endDate` | string | Yes | Cancellation date (`YYYY-MM-DD`) |
| `fwCost` | number | Yes | Amount FW pays to Classic |
| `retailCost` | number | Yes | Retail cost in FW |
| `deductible` | number | Yes | Deductible from Classic refund sheet |
| `approvedClaimAmount` | number | Yes | Approved claim amount |
| `agentId` | string | No | Agent / agency ID |
| `agentName` | string | No | Agent / producer name |
| `agentPercent` | number | No | Agent commission rate |

### GAP — response (`results`)

| Field | Type | Description |
|-------|------|-------------|
| `daysUsed` | number | Days between start and end |
| `prorated.daysPerDiem` | number | Daily proration rate |
| `prorated.ourPercent` | number | Percent of contract used |
| `prorated.fwProratedProfit` | number | FW prorated profit |
| `prorated.clientProratedProfit` | number | Client prorated profit |
| `refund.amountSentToClient` | number | Amount sent to client |
| `refund.clientRefundToCustomer` | number | **Client refund amount** — dealer/client refund to customer |
| `refund.totalCustomerReceives` | number | **Primary customer-facing total** |
| `refund.agentChargeback` | number | Pro-rated agent chargeback |
| `agentOriginalCommission` | number | Full agent commission |

---

## Saved cases

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | Response only | Case identifier |
| `name` | string | Yes | Display name |
| `type` | string | Yes | `freedom` or `gap` |
| `inputs` | object | Yes | `FreedomInputs` or `GapInputs` |
| `savedAt` | string (ISO) | Response only | Last save timestamp |
