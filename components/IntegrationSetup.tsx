'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { AppShell } from './AppShell'
import { codeBlockClass, panelClass, primaryButtonClass, subtlePanelClass } from '@/lib/ui-classes'

export function IntegrationSetup() {
  const { user, loading } = useAuth()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const isAdmin = user?.role === 'admin'

  const curlExample = `curl -s -X POST "${baseUrl}/api/calculate/freedom" \\
  -H "Authorization: Bearer rfnd_YOUR_API_KEY" \\
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
  }'`

  return (
    <AppShell active="integration">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">API integration setup</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Connect your external system to send contract data and receive refund calculations.
          </p>
        </div>

        <section className={panelClass}>
          <h2 className="text-lg font-semibold">Your account</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Signed in as <strong>{loading ? '…' : user?.email}</strong>
            {isAdmin && ' (administrator)'}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            API base URL: <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{baseUrl}</code>
          </p>
        </section>

        <section className={panelClass}>
          <h2 className="text-lg font-semibold">Step 1 — Get an API key</h2>
          {isAdmin ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              As an administrator, create a service user and API key in{' '}
              <Link href="/app/admin" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                Admin → API keys
              </Link>
              . Give the full key (<code>rfnd_…</code>) to the integrating system once — it cannot be
              retrieved later.
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Contact your administrator to create an API key for this account. The key is emailed to
              your address when provisioned. Store it in your secrets manager — it is shown only once.
            </p>
          )}
        </section>

        <section className={panelClass}>
          <h2 className="text-lg font-semibold">Step 2 — Send contract data</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Your system POSTs calculator fields plus a required <code>contractNumber</code> to one of:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <code>POST /api/calculate/freedom</code> — VSC refunds
            </li>
            <li>
              <code>POST /api/calculate/gap</code> — Gap refunds
            </li>
          </ul>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Each API-key request is automatically saved as a tracked record. The response includes
            refund totals, warnings, and a saved <code>case</code> id.
          </p>
        </section>

        <section className={panelClass}>
          <h2 className="text-lg font-semibold">Step 3 — Authenticate requests</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Send your API key on every request:
          </p>
          <pre className={`mt-3 ${codeBlockClass}`}>Authorization: Bearer rfnd_YOUR_API_KEY</pre>
        </section>

        <section className={panelClass}>
          <h2 className="text-lg font-semibold">Example request</h2>
          <pre className={`mt-3 overflow-x-auto ${codeBlockClass}`}>{curlExample}</pre>
        </section>

        <section className={subtlePanelClass}>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Field reference</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            See the{' '}
            <Link href="/docs" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              public API documentation
            </Link>{' '}
            for required fields per product type. Internal admin endpoints and contract-pull
            configuration are not published publicly.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/docs" className={primaryButtonClass}>
              View public API docs
            </Link>
            <Link href="/app" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
              Open calculators
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  )
}