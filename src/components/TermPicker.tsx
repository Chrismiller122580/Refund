import type { TermRow } from '../lib/calculators/terms'
import { CUSTOM_TERM_LABEL } from '../lib/calculators/terms'

interface TermPickerProps {
  terms: TermRow[]
  selectedLabel: string
  onSelect: (term: TermRow) => void
}

export function TermPicker({ terms, selectedLabel, onSelect }: TermPickerProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Contract Term</span>
        <select
          value={selectedLabel}
          onChange={(e) => {
            const label = e.target.value
            if (label === CUSTOM_TERM_LABEL) return
            const term = terms.find((t) => t.label === label)
            if (term) onSelect(term)
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {terms.map((term) => (
            <option key={term.label} value={term.label}>
              {term.label}
              {term.miles ? ` — ${term.miles.toLocaleString()} mi / ${term.days} days` : ` — ${term.days} days`}
            </option>
          ))}
          <option value={CUSTOM_TERM_LABEL}>Custom</option>
        </select>
      </label>
    </div>
  )
}
