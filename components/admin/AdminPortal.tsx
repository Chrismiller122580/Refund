'use client'

import { useState } from 'react'
import { AppShell } from '../AppShell'
import { ApiKeysPanel } from './ApiKeysPanel'
import { RecordsPanel } from './RecordsPanel'
import { UsersPanel } from './UsersPanel'

type AdminTab = 'users' | 'api-keys' | 'records'

export function AdminPortal() {
  const [tab, setTab] = useState<AdminTab>('users')

  return (
    <AppShell
      active="admin"
      headerExtra={
        <nav className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          {([
            ['users', 'Users'],
            ['records', 'Records'],
            ['api-keys', 'API keys'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      }
    >
      {tab === 'users' && <UsersPanel />}
      {tab === 'records' && <RecordsPanel />}
      {tab === 'api-keys' && <ApiKeysPanel />}
    </AppShell>
  )
}