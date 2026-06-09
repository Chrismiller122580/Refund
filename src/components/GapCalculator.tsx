import { useMemo, useState } from 'react'
import {
  calculateGap,
  DEFAULT_GAP_INPUTS,
  type GapInputs,
} from '../lib/calculators/gap'
import { GAP_TERMS } from '../lib/calculators/terms'
import {
  hasFieldError,
  validateGapInputs,
  warningsForField,
} from '../lib/calculators/validation'
import { formatCurrency, formatPercent } from '../lib/format'
import { DateInput, Field, NumberInput } from './Field'
import { ResultCard } from './ResultCard'
import { TermsTable } from './TermsTable'
import { ValidationAlerts } from './ValidationAlerts'

function fieldMessage(warnings: ReturnType<typeof validateGapInputs>, field: string) {
  const fieldWarnings = warningsForField(warnings, field)
  return fieldWarnings[0]?.message
}

export function GapCalculator() {
  const [inputs, setInputs] = useState<GapInputs>(DEFAULT_GAP_INPUTS)
  const results = useMemo(() => calculateGap(inputs), [inputs])
  const warnings = useMemo(() => validateGapInputs(inputs, results), [inputs, results])

  const update = <K extends keyof GapInputs>(key: K, value: GapInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Inputs</h2>
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
            <Field
              label="Deductible"
              hint="Obtain from Classic refund sheet"
            >
              <NumberInput value={inputs.deductible} onChange={(v) => update('deductible', v)} step={0.01} />
            </Field>
            <Field label="Approved Claim Amount">
              <NumberInput value={inputs.approvedClaimAmount} onChange={(v) => update('approvedClaimAmount', v)} step={0.01} />
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Derived Values</h2>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-blue-700">Days Used</dt>
              <dd className="text-right font-medium text-blue-900">{results.daysUsed}</dd>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Proration</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-slate-500">Days Per Diem</dt>
              <dd className="text-right text-slate-800">{formatCurrency(results.prorated.daysPerDiem)}</dd>
              <dt className="text-slate-500">Our %</dt>
              <dd className="text-right text-slate-800">{formatPercent(results.prorated.ourPercent)}</dd>
              <dt className="text-slate-500">FW Prorated Profit</dt>
              <dd className="text-right text-slate-800">{formatCurrency(results.prorated.fwProratedProfit)}</dd>
              <dt className="text-slate-500">Client Prorated Profit</dt>
              <dd className="text-right text-slate-800">{formatCurrency(results.prorated.clientProratedProfit)}</dd>
            </dl>
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Refund Results</h2>
        <div className="max-w-md">
          <ResultCard title="Refund per Days" {...results.refund} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Reference Terms</h2>
        <TermsTable terms={GAP_TERMS} />
      </section>
    </div>
  )
}
