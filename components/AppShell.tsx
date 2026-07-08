'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { ThemeToggle } from './ThemeToggle'
import {
  logoMarkClass,
  secondaryButtonClass,
  stickyHeaderClass,
  tabActiveClass,
  tabInactiveClass,
  userPillClass,
} from '@/lib/ui-classes'

interface AppShellProps {
  active: 'calculators' | 'admin'
  children: React.ReactNode
  headerExtra?: React.ReactNode
}

export function AppShell({ active, children, headerExtra }: AppShellProps) {
  const { user, loading, logout } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <header className={`${stickyHeaderClass} shadow-sm`}>
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Link href="/app" className={logoMarkClass}>
                RC
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Refund Calculators</h1>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                  {active === 'admin'
                    ? 'User, API key, and integration management'
                    : 'VSC and Gap refund calculations'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className={userPillClass}>{loading ? 'Loading…' : user?.email}</span>
              <ThemeToggle />
              <button type="button" onClick={() => logout()} className={secondaryButtonClass}>
                Logout
              </button>
            </div>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Link href="/app" className={active === 'calculators' ? tabActiveClass : tabInactiveClass}>
              Calculators
            </Link>
            {isAdmin && (
              <Link href="/app/admin" className={active === 'admin' ? tabActiveClass : tabInactiveClass}>
                Admin
              </Link>
            )}
          </nav>
          {headerExtra}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}