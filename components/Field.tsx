'use client'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
      {!error && hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  step?: number
  hasError?: boolean
}

export function NumberInput({ value, onChange, step = 1, hasError }: NumberInputProps) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
        hasError
          ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
      }`}
    />
  )
}

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  hasError?: boolean
}

export function DateInput({ value, onChange, hasError }: DateInputProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
        hasError
          ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
      }`}
    />
  )
}
