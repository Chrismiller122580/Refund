import Link from 'next/link'
import { LoginForm } from '@/components/LoginForm'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              RC
            </span>
            <span className="text-sm font-medium">Refund Calculators</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign in</h1>
          <p className="mt-1 mb-6 text-sm text-slate-600 dark:text-slate-400">Access Freedom and GAP refund calculators</p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
