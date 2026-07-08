import type { TermRow } from '@/lib/calculators/terms'
import { formatNumber } from '@/lib/format'

interface TermsTableProps {
  terms: TermRow[]
  showMiles?: boolean
}

export function TermsTable({ terms, showMiles = false }: TermsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:bg-slate-800/60 text-left text-slate-600 dark:text-slate-400">
            <th className="px-4 py-2.5 font-medium">Term</th>
            <th className="px-4 py-2.5 font-medium">Months</th>
            {showMiles && <th className="px-4 py-2.5 font-medium">Miles</th>}
            <th className="px-4 py-2.5 font-medium">Days</th>
            {showMiles && (
              <th className="px-4 py-2.5 font-medium">Miles/Day</th>
            )}
          </tr>
        </thead>
        <tbody>
          {terms.map((term) => (
            <tr key={term.label} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2 text-slate-800 dark:text-slate-200">{term.label}</td>
              <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{term.months}</td>
              {showMiles && (
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {term.miles?.toLocaleString()}
                </td>
              )}
              <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{term.days}</td>
              {showMiles && term.miles && (
                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  {formatNumber(term.miles / term.days, 2)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
