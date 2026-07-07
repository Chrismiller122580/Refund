/**
 * Refund API client — Node.js 18+
 *
 * Usage:
 *   REFUND_API_BASE_URL=https://refund-mocha-psi.vercel.app \
 *   REFUND_API_KEY=rfnd_... \
 *   node docs/examples/refund-api-client.mjs
 */

const BASE_URL = process.env.REFUND_API_BASE_URL ?? 'http://localhost:3000'
const API_KEY = process.env.REFUND_API_KEY

if (!API_KEY) {
  console.error('Set REFUND_API_KEY (rfnd_...)')
  process.exit(1)
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...(options.headers ?? {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data
}

const freedomInputs = {
  startMileage: 101520,
  endMileage: 204145,
  contractTermMiles: 5000,
  contractTermDays: 1095,
  startDate: '2024-06-25',
  endDate: '2025-10-29',
  cost: 1928,
  markup: 1050,
  deductible: 50,
  approvedClaimAmount: 0,
  unlimitedMileage: false,
}

const me = await request('/api/auth/me')
console.log('Authenticated as:', me.user.email, `(${me.user.role})`)

const calc = await request('/api/calculate/freedom', {
  method: 'POST',
  body: JSON.stringify(freedomInputs),
})
console.log('Recommendation:', calc.recommendation.message)
console.log('Days total:', calc.recommendation.daysTotal)

const saved = await request('/api/cases', {
  method: 'POST',
  body: JSON.stringify({
    name: `Integration test ${new Date().toISOString()}`,
    type: 'freedom',
    inputs: freedomInputs,
  }),
})
console.log('Saved case:', saved.case.id, saved.case.name)