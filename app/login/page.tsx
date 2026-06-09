import { LoginForm } from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Refund Calculators</h1>
        <p className="mt-1 mb-6 text-sm text-slate-600">Sign in to continue</p>
        <LoginForm />
      </div>
    </div>
  )
}
