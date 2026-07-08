'use client'

import type { TermRow } from '@/lib/calculators/terms'
import { CUSTOM_TERM_LABEL } from '@/lib/calculators/terms'
import { selectClass } from '@/lib/ui-classes'

interface TermPickerProps {
  terms: TermRow[]
  selectedLabel: string
  onSelect: (term: TermRow) => void
}

export function TermPicker({ terms, selectedLabel, onSelect }: TermPickerProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 p-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Contract Term</span>
        <select
          value={selectedLabel}
          onChange={(e) => {
            const label = e.target.value
            if (label === CUSTOM_TERM_LABEL) return
            const term = terms.find((t) => t.label === label)
            if (term) onSelect(term)
          }}
          className={selectClass}
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
