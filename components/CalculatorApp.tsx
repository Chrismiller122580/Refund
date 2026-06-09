'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { FreedomCalculator } from './FreedomCalculator'
import { GapCalculator } from './GapCalculator'

type Tab = 'freedom' | 'gap'

export function CalculatorApp() {
  const [tab, setTab] = useState<Tab>('freedom')
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Refund Calculators</h1>
              <p className="mt-1 text-sm text-slate-600">
                Freedom and GAP warranty refund calculations
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>{user?.email}</span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
          <nav className="mt-4 flex gap-2">
            {([
              ['freedom', 'Freedom'],
              ['gap', 'GAP'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {tab === 'freedom' ? <FreedomCalculator /> : <GapCalculator />}
      </main>
    </div>
  )
}
