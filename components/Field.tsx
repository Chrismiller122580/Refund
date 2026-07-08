'use client'

import { dateInputClass, numberInputClass } from '@/lib/ui-classes'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600 dark:text-red-400 dark:text-red-400">{error}</span>}
      {!error && hint && <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">{hint}</span>}
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
      className={hasError ? numberInputClass.error : numberInputClass.base}
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
      className={hasError ? dateInputClass.error : dateInputClass.base}
    />
  )
}