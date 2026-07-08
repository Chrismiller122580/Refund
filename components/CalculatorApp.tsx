'use client'

import { useState } from 'react'
import { tabActiveClass, tabInactiveClass } from '@/lib/ui-classes'
import { AppShell } from './AppShell'
import { FreedomCalculator } from './FreedomCalculator'
import { GapCalculator } from './GapCalculator'

type Tab = 'freedom' | 'gap'

export function CalculatorApp() {
  const [tab, setTab] = useState<Tab>('freedom')

  return (
    <AppShell
      active="calculators"
      headerExtra={
        <nav className="mt-4 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {([
            ['freedom', 'Freedom'],
            ['gap', 'GAP'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={tab === id ? tabActiveClass : tabInactiveClass}
            >
              {label}
            </button>
          ))}
        </nav>
      }
    >
      {tab === 'freedom' ? <FreedomCalculator /> : <GapCalculator />}
    </AppShell>
  )
}
