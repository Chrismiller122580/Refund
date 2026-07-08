'use client'

import { useState } from 'react'
import { AppShell } from '../AppShell'
import { ApiKeysPanel } from './ApiKeysPanel'
import { RecordsPanel } from './RecordsPanel'
import { UsersPanel } from './UsersPanel'
import { adminTabActiveClass, adminTabInactiveClass } from '@/lib/ui-classes'

type AdminTab = 'users' | 'api-keys' | 'records'

export function AdminPortal() {
  const [tab, setTab] = useState<AdminTab>('users')

  return (
    <AppShell
      active="admin"
      headerExtra={
        <nav className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {([
            ['users', 'Users'],
            ['records', 'Records'],
            ['api-keys', 'API keys'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={tab === id ? adminTabActiveClass : adminTabInactiveClass}
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