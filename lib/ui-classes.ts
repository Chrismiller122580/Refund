const inputBase =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-100'

export const inputClass = `${inputBase} border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-600 dark:focus:border-blue-400`

export const selectClass = inputClass

export const inputErrorClass = `${inputBase} border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500`

export const numberInputClass = {
  base: inputClass,
  error: inputErrorClass,
}

export const dateInputClass = numberInputClass

export const panelClass =
  'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900'

export const subtlePanelClass =
  'rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60'

export const tableClass = 'w-full text-left text-sm'

export const thClass =
  'border-b border-slate-200 px-3 py-2 font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300'

export const tdClass = 'border-b border-slate-100 px-3 py-2 text-slate-800 dark:border-slate-800 dark:text-slate-200'

export const primaryButtonClass =
  'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400'

export const secondaryButtonClass =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'

export const dangerButtonClass =
  'rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40'

export const tabActiveClass = 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm dark:bg-blue-500'

export const tabInactiveClass =
  'rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'

export const adminTabActiveClass = 'rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm dark:bg-slate-200 dark:text-slate-900'

export const adminTabInactiveClass =
  'rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'