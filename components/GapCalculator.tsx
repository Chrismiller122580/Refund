'use client'

import { useState } from 'react'
import {
  DEFAULT_GAP_INPUTS,
  type GapInputs,
} from '@/lib/calculators/gap'
import { useGapCalculation } from '@/hooks/useGapCalculation'
import { GAP_TERMS, matchGapTerm, type TermRow } from '@/lib/calculators/terms'
import {
  hasFieldError,
  validateGapInputs,
  warningsForField,
} from '@/lib/calculators/validation'
import { formatGapSummary } from '@/lib/export'
import { formatCurrency, formatPercent } from '@/lib/format'
import { CaseManager } from './CaseManager'
import { DateInput, Field, NumberInput } from './Field'
import { ExportMenu } from './ExportMenu'
import { ResultCard } from './ResultCard'
import { TermPicker } from './TermPicker'
import { ValidationAlerts } from './ValidationAlerts'
import {
  calculatorPanelClass,
  gapAccentBorder,
  panelHeaderClass,
  panelSubheaderClass,
  subtlePanelClass,
} from '@/lib/ui-classes'

function fieldMessage(warnings: ReturnType<typeof validateGapInputs>, field: string) {
  const fieldWarnings = warningsForField(warnings, field)
  return fieldWarnings[0]?.message
}

export function GapCalculator() {
  const [inputs, setInputs] = useState<GapInputs>(DEFAULT_GAP_INPUTS)
  const [termLabel, setTermLabel] = useState(() => matchGapTerm(DEFAULT_GAP_INPUTS.contractTermDays))

  const { data, loading, error } = useGapCalculation(inputs)
  const results = data?.results
  const warnings = data?.warnings ?? []

  const update = <K extends keyof GapInputs>(key: K, value: GapInputs[K]) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'contractTermDays') {
        setTermLabel(matchGapTerm(next.contractTermDays))
      }
      return next
    })
  }

  const handleTermSelect = (term: TermRow) => {
    setTermLabel(term.label)
    setInputs((prev) => ({ ...prev, contractTermDays: term.days }))
  }

  const handleLoad = (loaded: GapInputs) => {
    setInputs(loaded)
    setTermLabel(matchGapTerm(loaded.contractTermDays))
  }

  const handleReset = () => {
    setInputs(DEFAULT_GAP_INPUTS)
    setTermLabel(matchGapTerm(DEFAULT_GAP_INPUTS.contractTermDays))
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Calculating…</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className={`${calculatorPanelClass} ${gapAccentBorder} space-y-4`}>
          <div>
            <h2 className={panelHeaderClass}>Inputs</h2>
            <p className={panelSubheaderClass}>Contract term, dates, and cost details</p>
          </div>
          <TermPicker terms={GAP_TERMS} selectedLabel={termLabel} onSelect={handleTermSelect} />
          <ValidationAlerts warnings={warnings} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contract Term Days" error={fieldMessage(warnings, 'contractTermDays')}>
              <NumberInput
                value={inputs.contractTermDays}
                onChange={(v) => update('contractTermDays', v)}
                hasError={hasFieldError(warnings, 'contractTermDays')}
              />
            </Field>
            <Field label="Start Date" error={fieldMessage(warnings, 'startDate')}>
              <DateInput
                value={inputs.startDate}
                onChange={(v) => update('startDate', v)}
                hasError={hasFieldError(warnings, 'startDate')}
              />
            </Field>
            <Field label="End Date" error={fieldMessage(warnings, 'endDate')}>
              <DateInput
                value={inputs.endDate}
                onChange={(v) => update('endDate', v)}
                hasError={hasFieldError(warnings, 'endDate')}
              />
            </Field>
            <Field
              label="FW Cost"
              hint="What FW pays to Classic (from Classic breakdown sheet)"
              error={fieldMessage(warnings, 'fwCost')}
            >
              <NumberInput
                value={inputs.fwCost}
                onChange={(v) => update('fwCost', v)}
                step={0.01}
                hasError={hasFieldError(warnings, 'fwCost')}
              />
            </Field>
            <Field label="Retail Cost in FW" error={fieldMessage(warnings, 'retailCost')}>
              <NumberInput
                value={inputs.retailCost}
                onChange={(v) => update('retailCost', v)}
                step={0.01}
                hasError={hasFieldError(warnings, 'retailCost')}
              />
            </Field>
            <Field label="Deductible" hint="Obtain from Classic refund sheet">
              <NumberInput value={inputs.deductible} onChange={(v) => update('deductible', v)} step={0.01} />
            </Field>
            <Field label="Approved Claim Amount">
              <NumberInput value={inputs.approvedClaimAmount} onChange={(v) => update('approvedClaimAmount', v)} step={0.01} />
            </Field>
          </div>
        </section>

        <section className={`${calculatorPanelClass} space-y-4`}>
          <div>
            <h2 className={panelHeaderClass}>Derived Values</h2>
            <p className={panelSubheaderClass}>Proration breakdown from your inputs</p>
          </div>
          {results ? (
          <>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-slate-600 dark:text-slate-400">Days Used</dt>
              <dd className="text-right font-medium text-slate-900 dark:text-slate-100">{results.daysUsed}</dd>
            </dl>
          </div>

          <div className={subtlePanelClass}>
            <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">Proration</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-slate-500 dark:text-slate-400">Days Per Diem</dt>
              <dd className="text-right text-slate-800 dark:text-slate-200">{formatCurrency(results.prorated.daysPerDiem)}</dd>
              <dt className="text-slate-500 dark:text-slate-400">Our %</dt>
              <dd className="text-right text-slate-800 dark:text-slate-200">{formatPercent(results.prorated.ourPercent)}</dd>
              <dt className="text-slate-500 dark:text-slate-400">FW Prorated Profit</dt>
              <dd className="text-right text-slate-800 dark:text-slate-200">{formatCurrency(results.prorated.fwProratedProfit)}</dd>
              <dt className="text-slate-500 dark:text-slate-400">Client Prorated Profit</dt>
              <dd className="text-right text-slate-800 dark:text-slate-200">{formatCurrency(results.prorated.clientProratedProfit)}</dd>
            </dl>
          </div>
          </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter inputs to see results.</p>
          )}
        </section>
      </div>

      <section className={`${calculatorPanelClass} space-y-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={panelHeaderClass}>Refund Results</h2>
            <p className={panelSubheaderClass}>Dealer and customer refund breakdown</p>
          </div>
          <ExportMenu
            filename={`gap-refund-${new Date().toISOString().slice(0, 10)}.txt`}
            getSummary={() => results ? formatGapSummary(inputs, results, warnings, termLabel) : ''}
          />
        </div>
        {results && (
        <div className="max-w-md">
          <ResultCard title="Refund per Days" accent="gap" {...results.refund} />
        </div>
        )}
      </section>

      <CaseManager type="gap" inputs={inputs} onLoad={handleLoad} onReset={handleReset} />
    </div>
  )
}
