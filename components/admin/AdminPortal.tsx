'use client'

import { useState } from 'react'
import { AppShell } from '../AppShell'
import { useAuth } from '../AuthProvider'
import { ApiKeysPanel } from './ApiKeysPanel'
import { RecordsPanel } from './RecordsPanel'
import { UsersPanel } from './UsersPanel'
import { adminTabActiveClass, adminTabInactiveClass } from '@/lib/ui-classes'

type AdminTab = 'users' | 'api-keys' | 'records'

export function AdminPortal() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [tab, setTab] = useState<AdminTab>(isAdmin ? 'users' : 'api-keys')

  const tabs: { id: AdminTab; label: string }[] = [
    ...(isAdmin ? [{ id: 'users' as const, label: 'Users' }] : []),
    { id: 'records', label: 'Records' },
    { id: 'api-keys', label: 'API keys' },
  ]

  return (
    <AppShell
      active="admin"
      headerExtra={
        <nav className="flex flex-wrap gap-2">
          {tabs.map(({ id, label }) => (
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
      {tab === 'users' && isAdmin && <UsersPanel />}
      {tab === 'records' && <RecordsPanel />}
      {tab === 'api-keys' && <ApiKeysPanel />}
    </AppShell>
  )
}
