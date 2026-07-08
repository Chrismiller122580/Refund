'use client'

import { useState } from 'react'
import {
  freedomTabActiveClass,
  gapTabActiveClass,
  panelSubheaderClass,
  tabInactiveClass,
} from '@/lib/ui-classes'
import { AppShell } from './AppShell'
import { FreedomCalculator } from './FreedomCalculator'
import { GapCalculator } from './GapCalculator'

type Tab = 'freedom' | 'gap'

const tabMeta: Record<Tab, { label: string; description: string; activeClass: string }> = {
  freedom: {
    label: 'VSC',
    description: 'Vehicle service contract refunds with mileage and per-diem comparison',
    activeClass: freedomTabActiveClass,
  },
  gap: {
    label: 'Gap',
    description: 'Guaranteed asset protection term-based refund calculations',
    activeClass: gapTabActiveClass,
  },
}

export function CalculatorApp() {
  const [tab, setTab] = useState<Tab>('freedom')
  const meta = tabMeta[tab]

  return (
    <AppShell
      active="calculators"
      headerExtra={
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <nav className="flex flex-wrap gap-2">
            {(Object.keys(tabMeta) as Tab[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={tab === id ? tabMeta[id].activeClass : tabInactiveClass}
              >
                {tabMeta[id].label}
              </button>
            ))}
          </nav>
          <p className={`${panelSubheaderClass} mt-2`}>{meta.description}</p>
        </div>
      }
    >
      {tab === 'freedom' ? <FreedomCalculator /> : <GapCalculator />}
    </AppShell>
  )
}