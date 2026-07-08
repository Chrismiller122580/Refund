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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/app" className="flex items-center gap-2.5">
            <span className={logoMarkClass}>RC</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Refund Calculators</span>
          </Link>

          <nav className="order-3 flex w-full gap-2 sm:order-none sm:w-auto">
            <Link href="/app" className={active === 'calculators' ? tabActiveClass : tabInactiveClass}>
              Calculators
            </Link>
            {isAdmin && (
              <Link href="/app/admin" className={active === 'admin' ? tabActiveClass : tabInactiveClass}>
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 text-sm">
            <span className={`${userPillClass} hidden sm:inline`}>{loading ? 'Loading…' : user?.email}</span>
            <ThemeToggle />
            <button type="button" onClick={() => logout()} className={secondaryButtonClass}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {headerExtra && (
          <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">{headerExtra}</div>
        )}
        {children}
      </main>
    </div>
  )
}