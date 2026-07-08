export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-400/20 to-slate-400/10 blur-2xl dark:from-blue-500/10 dark:to-slate-500/5" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-950/50">
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                RC
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Refund Calculators</span>
            </div>
            <div className="flex gap-1.5">
              <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">VSC</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Gap
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            {['Start Date', 'End Date', 'Cost', 'Mark Up'].map((label) => (
              <div key={label}>
                <div className="mb-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">{label}</div>
                <div className="h-7 rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60" />
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-3 dark:border-blue-900/50 dark:bg-blue-950/30">
            <div className="text-[10px] font-medium text-blue-700 dark:text-blue-300">Derived · Days used</div>
            <div className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100">142 days</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Refund per Miles</div>
              <div className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">$1,247.50</div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 ring-1 ring-blue-200/60 dark:border-blue-800 dark:bg-blue-950/20 dark:ring-blue-800/40">
              <div className="text-[10px] font-medium text-blue-600 dark:text-blue-400">Refund per Days ✓</div>
              <div className="mt-1 text-base font-bold text-blue-900 dark:text-blue-100">$1,312.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}