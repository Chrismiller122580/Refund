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
        highlight ? 'border-t border-slate-200 pt-3 font-semibold' : ''
      }`}
    >
      <span className={highlight ? 'text-slate-900' : 'text-slate-600'}>{label}</span>
      <span
        className={
          highlight
            ? negative
              ? 'text-lg text-amber-700'
              : 'text-lg text-slate-900'
            : negative
              ? 'text-amber-700'
              : 'text-slate-800'
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
}

export function ResultCard({
  title,
  amountSentToClient,
  clientRefundToCustomer,
  totalCustomerReceives,
}: ResultCardProps) {
  const isNegative = totalCustomerReceives < 0

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm ${
        isNegative ? 'border-amber-300' : 'border-slate-200'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {isNegative && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Negative refund
          </span>
        )}
      </div>
      <ResultRow label="Amount Sent to Client" value={amountSentToClient} negative={amountSentToClient < 0} />
      <ResultRow label="Client Refund to Customer" value={clientRefundToCustomer} negative={clientRefundToCustomer < 0} />
      <ResultRow
        label="Total Customer Receives"
        value={totalCustomerReceives}
        highlight
        negative={isNegative}
      />
    </div>
  )
}
