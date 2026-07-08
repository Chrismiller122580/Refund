import { formatCurrency } from '@/lib/format'

interface ResultRowProps {
  label: string
  value: number
  highlight?: boolean
  negative?: boolean
}

function ResultRow({ label, value, highlight, negative }: ResultRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${
        highlight
          ? '-mx-5 mt-1 rounded-lg bg-slate-50 px-5 py-3 font-semibold dark:bg-slate-800/60'
          : ''
      }`}
    >
      <span className={highlight ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}>
        {label}
      </span>
      <span
        className={
          highlight
            ? negative
              ? 'text-lg text-amber-700 dark:text-amber-400'
              : 'text-lg text-slate-900 dark:text-slate-100'
            : negative
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-slate-800 dark:text-slate-200'
        }
      >
        {formatCurrency(value)}
      </span>
    </div>
  )
}

interface ResultCardProps {
  title: string
  amountSentToClient: number
  clientRefundToCustomer: number
  totalCustomerReceives: number
  accent?: 'freedom' | 'gap'
  recommended?: boolean
}

export function ResultCard({
  title,
  amountSentToClient,
  clientRefundToCustomer,
  totalCustomerReceives,
  accent = 'freedom',
  recommended,
}: ResultCardProps) {
  const isNegative = totalCustomerReceives < 0
  const accentColor = accent === 'gap' ? 'bg-slate-500' : 'bg-blue-500'

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-900 ${
        recommended
          ? 'border-blue-300 ring-1 ring-blue-200 dark:border-blue-700 dark:ring-blue-800/50'
          : isNegative
            ? 'border-amber-300 dark:border-amber-700'
            : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${accentColor}`} />
      <div className="p-5 pt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {recommended && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              Recommended
            </span>
          )}
          {isNegative && !recommended && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Negative refund
            </span>
          )}
        </div>
        <ResultRow label="Amount Sent to Client" value={amountSentToClient} negative={amountSentToClient < 0} />
        <ResultRow
          label="Client Refund to Customer"
          value={clientRefundToCustomer}
          negative={clientRefundToCustomer < 0}
        />
        <ResultRow
          label="Total Customer Receives"
          value={totalCustomerReceives}
          highlight
          negative={isNegative}
        />
      </div>
    </div>
  )
}