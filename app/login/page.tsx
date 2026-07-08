import Link from 'next/link'
import { LoginForm } from '@/components/LoginForm'
import { ThemeToggle } from '@/components/ThemeToggle'
import { logoMarkClass, panelClass } from '@/lib/ui-classes'

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute inset-0 bg-grid-subtle" />
      <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl dark:bg-blue-900/20" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <span className={logoMarkClass}>RC</span>
            <span className="text-sm font-medium">Refund Calculators</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className={panelClass}>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign in</h1>
          <p className="mt-1 mb-6 text-sm text-slate-600 dark:text-slate-400">
            Access VSC and Gap refund calculators
          </p>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Integrating a system?{' '}
            <Link href="/docs" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              View public API docs
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}