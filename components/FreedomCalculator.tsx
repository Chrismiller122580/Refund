'use client'

import { useState } from 'react'
import {
  DEFAULT_FREEDOM_INPUTS,
  type FreedomInputs,
} from '@/lib/calculators/freedom'
import { useFreedomCalculation } from '@/hooks/useFreedomCalculation'
import {
  FREEDOM_TERMS,
  matchFreedomTerm,
  matchFreedomTermByDays,
  type TermRow,
} from '@/lib/calculators/terms'
import {
  hasFieldError,
  validateFreedomInputs,
  warningsForField,
} from '@/lib/calculators/validation'
import { formatFreedomSummary } from '@/lib/export'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format'
import { AdvisorCard } from './AdvisorCard'
import { CaseManager } from './CaseManager'
import { DateInput, Field, NumberInput } from './Field'
import { ExportMenu } from './ExportMenu'
import { ResultCard } from './ResultCard'
import { TermPicker } from './TermPicker'
import { ValidationAlerts } from './ValidationAlerts'
import {
  calculatorPanelClass,
  freedomAccentBorder,
  panelHeaderClass,
  panelSubheaderClass,
  subtlePanelClass,
} from '@/lib/ui-classes'

function ProratedSection({
  title,
  mileagePerDay,
  daysPerDiem,
  costPerMile,
  ourPercent,
  fwProratedProfit,
  clientProratedProfit,
  showMileage,
}: {
  title: string
  mileagePerDay: number
  daysPerDiem: number
  costPerMile: number
  ourPercent: number
  fwProratedProfit: number
  clientProratedProfit: number
  showMileage: boolean
}) {
  return (
    <div className={subtlePanelClass}>
      <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {showMileage && (
          <>
            <dt className="text-slate-500 dark:text-slate-400">Mileage Per Day</dt>
            <dd className="text-right text-slate-800 dark:text-slate-200">{formatNumber(mileagePerDay, 4)}</dd>
            <dt className="text-slate-500 dark:text-slate-400">Cost of One Mile</dt>
            <dd className="text-right text-slate-800 dark:text-slate-200">{formatNumber(costPerMile, 4)}</dd>
          </>
        )}
        <dt className="text-slate-500 dark:text-slate-400">Days Per Diem</dt>
        <dd className="text-right text-slate-800 dark:text-slate-200">{formatCurrency(daysPerDiem)}</dd>
        <dt className="text-slate-500 dark:text-slate-400">Our %</dt>
        <dd className="text-right text-slate-800 dark:text-slate-200">{formatPercent(ourPercent)}</dd>
        <dt className="text-slate-500 dark:text-slate-400">FW Prorated Profit</dt>
        <dd className="text-right text-slate-800 dark:text-slate-200">{formatCurrency(fwProratedProfit)}</dd>
        <dt className="text-slate-500 dark:text-slate-400">Client Prorated Profit</dt>
        <dd className="text-right text-slate-800 dark:text-slate-200">{formatCurrency(clientProratedProfit)}</dd>
      </dl>
    </div>
  )
}

function fieldMessage(warnings: ReturnType<typeof validateFreedomInputs>, field: string) {
  const fieldWarnings = warningsForField(warnings, field)
  return fieldWarnings[0]?.message
}

function resolveTermLabel(inputs: FreedomInputs): string {
  if (inputs.unlimitedMileage) {
    return matchFreedomTermByDays(inputs.contractTermDays)
  }
  return matchFreedomTerm(inputs.contractTermMiles, inputs.contractTermDays)
}

export function FreedomCalculator() {
  const [inputs, setInputs] = useState<FreedomInputs>(DEFAULT_FREEDOM_INPUTS)
  const [termLabel, setTermLabel] = useState(() => resolveTermLabel(DEFAULT_FREEDOM_INPUTS))

  const { data, loading, error } = useFreedomCalculation(inputs)
  const results = data?.results
  const warnings = data?.warnings ?? []
  const recommendation = data?.recommendation
  const unlimitedMileage = inputs.unlimitedMileage

  const update = <K extends keyof FreedomInputs>(key: K, value: FreedomInputs[K]) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: value }
      if (
        key === 'contractTermMiles' ||
        key === 'contractTermDays' ||
        key === 'unlimitedMileage'
      ) {
        setTermLabel(resolveTermLabel(next))
      }
      return next
    })
  }

  const handleTermSelect = (term: TermRow) => {
    setTermLabel(term.label)
    setInputs((prev) => ({
      ...prev,
      contractTermDays: term.days,
      ...(prev.unlimitedMileage ? {} : { contractTermMiles: term.miles ?? prev.contractTermMiles }),
    }))
  }

  const handleLoad = (loaded: FreedomInputs) => {
    const normalized = { ...loaded, unlimitedMileage: loaded.unlimitedMileage ?? false }
    setInputs(normalized)
    setTermLabel(resolveTermLabel(normalized))
  }

  const handleReset = () => {
    setInputs(DEFAULT_FREEDOM_INPUTS)
    setTermLabel(resolveTermLabel(DEFAULT_FREEDOM_INPUTS))
  }

  return (
    <div className="space-y-8">
      <CaseManager type="freedom" inputs={inputs} onLoad={handleLoad} onReset={handleReset} />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Calculating…</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className={`${calculatorPanelClass} ${freedomAccentBorder} space-y-4`}>
          <div>
            <h2 className={panelHeaderClass}>Inputs</h2>
            <p className={panelSubheaderClass}>Contract dates, mileage, and cost details</p>
          </div>
          <TermPicker terms={FREEDOM_TERMS} selectedLabel={termLabel} onSelect={handleTermSelect} />
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 px-4 py-3">
            <input
              type="checkbox"
              checked={unlimitedMileage}
              onChange={(e) => update('unlimitedMileage', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Unlimited mileage</span>
          </label>
          <ValidationAlerts warnings={warnings} />
          <div className="grid gap-4 sm:grid-cols-2">
            {!unlimitedMileage && (
              <>
                <Field label="Start Mileage" error={fieldMessage(warnings, 'startMileage')}>
                  <NumberInput
                    value={inputs.startMileage}
                    onChange={(v) => update('startMileage', v)}
                    hasError={hasFieldError(warnings, 'startMileage')}
                  />
                </Field>
                <Field label="End Mileage" error={fieldMessage(warnings, 'endMileage')}>
                  <NumberInput
                    value={inputs.endMileage}
                    onChange={(v) => update('endMileage', v)}
                    hasError={hasFieldError(warnings, 'endMileage')}
                  />
                </Field>
                <Field label="Contract Term Miles" error={fieldMessage(warnings, 'contractTermMiles')}>
                  <NumberInput
                    value={inputs.contractTermMiles}
                    onChange={(v) => update('contractTermMiles', v)}
                    hasError={hasFieldError(warnings, 'contractTermMiles')}
                  />
                </Field>
              </>
            )}
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
            <Field label="Cost" error={fieldMessage(warnings, 'cost')}>
              <NumberInput
                value={inputs.cost}
                onChange={(v) => update('cost', v)}
                step={0.01}
                hasError={hasFieldError(warnings, 'cost')}
              />
            </Field>
            <Field label="Mark Up" error={fieldMessage(warnings, 'markup')}>
              <NumberInput
                value={inputs.markup}
                onChange={(v) => update('markup', v)}
                step={0.01}
                hasError={hasFieldError(warnings, 'markup')}
              />
            </Field>
            <Field label="Deductible">
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
            <p className={panelSubheaderClass}>Proration breakdown and advisor recommendation</p>
          </div>
          {results ? (
          <>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {!unlimitedMileage && (
                <>
              <dt className="text-blue-700 dark:text-blue-300">Mile Cap</dt>
              <dd className="text-right font-medium text-blue-900 dark:text-blue-100">{results.mileCap.toLocaleString()}</dd>
              <dt className="text-blue-700 dark:text-blue-300">Miles Driven</dt>
              <dd className="text-right font-medium text-blue-900 dark:text-blue-100">{results.milesDriven.toLocaleString()}</dd>
                </>
              )}
              <dt className="text-blue-700 dark:text-blue-300">Days Used</dt>
              <dd className="text-right font-medium text-blue-900 dark:text-blue-100">{results.daysUsed}</dd>
            </dl>
          </div>

          {recommendation && <AdvisorCard recommendation={recommendation} />}
          {!unlimitedMileage && (
            <ProratedSection title="Mileage-Based Proration" showMileage {...results.miles} />
          )}
          <ProratedSection title="Days-Based Proration" showMileage={false} {...results.days} />
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
            filename={`freedom-refund-${new Date().toISOString().slice(0, 10)}.txt`}
            getSummary={() =>
              results && recommendation
                ? formatFreedomSummary(inputs, results, warnings, recommendation, termLabel)
                : ''
            }
          />
        </div>
        {results && recommendation ? (
        <div className={`grid gap-4 ${unlimitedMileage ? '' : 'md:grid-cols-2'}`}>
          {!unlimitedMileage && (
            <ResultCard
              title="Refund per Miles"
              accent="freedom"
              recommended={recommendation.recommended === 'miles'}
              {...results.refundPerMiles}
            />
          )}
          <ResultCard
            title="Refund per Days"
            accent="freedom"
            recommended={
              recommendation.recommended === 'days' || recommendation.recommended === 'equivalent'
            }
            {...results.refundPerDays}
          />
        </div>
        ) : null}
      </section>

    </div>
  )
}
