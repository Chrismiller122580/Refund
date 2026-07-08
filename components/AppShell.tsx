'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { ThemeToggle } from './ThemeToggle'
import { tabActiveClass, tabInactiveClass } from '@/lib/ui-classes'

interface AppShellProps {
  active: 'calculators' | 'admin'
  children: React.ReactNode
  headerExtra?: React.ReactNode
}

export function AppShell({ active, children, headerExtra }: AppShellProps) {
  const { user, loading, logout } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Refund Calculators</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400">
                {active === 'admin'
                  ? 'User, API key, and integration management'
                  : 'Freedom and GAP warranty refund calculations'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-300">
              <span>{loading ? 'Loading…' : user?.email}</span>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-950 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/app"
              className={active === 'calculators' ? tabActiveClass : tabInactiveClass}
            >
              Calculators
            </Link>
            {isAdmin && (
              <Link
                href="/app/admin"
                className={active === 'admin' ? tabActiveClass : tabInactiveClass}
              >
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