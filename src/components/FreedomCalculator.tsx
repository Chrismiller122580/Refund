import { useMemo, useState } from 'react'
import {
  calculateFreedom,
  DEFAULT_FREEDOM_INPUTS,
  type FreedomInputs,
} from '../lib/calculators/freedom'
import { FREEDOM_TERMS } from '../lib/calculators/terms'
import {
  hasFieldError,
  validateFreedomInputs,
  warningsForField,
} from '../lib/calculators/validation'
import { formatCurrency, formatNumber, formatPercent } from '../lib/format'
import { DateInput, Field, NumberInput } from './Field'
import { ResultCard } from './ResultCard'
import { TermsTable } from './TermsTable'
import { ValidationAlerts } from './ValidationAlerts'

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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {showMileage && (
          <>
            <dt className="text-slate-500">Mileage Per Day</dt>
            <dd className="text-right text-slate-800">{formatNumber(mileagePerDay, 4)}</dd>
            <dt className="text-slate-500">Cost of One Mile</dt>
            <dd className="text-right text-slate-800">{formatNumber(costPerMile, 4)}</dd>
          </>
        )}
        <dt className="text-slate-500">Days Per Diem</dt>
        <dd className="text-right text-slate-800">{formatCurrency(daysPerDiem)}</dd>
        <dt className="text-slate-500">Our %</dt>
        <dd className="text-right text-slate-800">{formatPercent(ourPercent)}</dd>
        <dt className="text-slate-500">FW Prorated Profit</dt>
        <dd className="text-right text-slate-800">{formatCurrency(fwProratedProfit)}</dd>
        <dt className="text-slate-500">Client Prorated Profit</dt>
        <dd className="text-right text-slate-800">{formatCurrency(clientProratedProfit)}</dd>
      </dl>
    </div>
  )
}

function fieldMessage(warnings: ReturnType<typeof validateFreedomInputs>, field: string) {
  const fieldWarnings = warningsForField(warnings, field)
  return fieldWarnings[0]?.message
}

export function FreedomCalculator() {
  const [inputs, setInputs] = useState<FreedomInputs>(DEFAULT_FREEDOM_INPUTS)
  const results = useMemo(() => calculateFreedom(inputs), [inputs])
  const warnings = useMemo(() => validateFreedomInputs(inputs, results), [inputs, results])

  const update = <K extends keyof FreedomInputs>(key: K, value: FreedomInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Inputs</h2>
          <ValidationAlerts warnings={warnings} />
          <div className="grid gap-4 sm:grid-cols-2">
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

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Derived Values</h2>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-blue-700">Mile Cap</dt>
              <dd className="text-right font-medium text-blue-900">{results.mileCap.toLocaleString()}</dd>
              <dt className="text-blue-700">Miles Driven</dt>
              <dd className="text-right font-medium text-blue-900">{results.milesDriven.toLocaleString()}</dd>
              <dt className="text-blue-700">Days Used</dt>
              <dd className="text-right font-medium text-blue-900">{results.daysUsed}</dd>
            </dl>
          </div>

          <ProratedSection title="Mileage-Based Proration" showMileage {...results.miles} />
          <ProratedSection title="Days-Based Proration" showMileage={false} {...results.days} />
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Refund Results</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ResultCard title="Refund per Miles" {...results.refundPerMiles} />
          <ResultCard title="Refund per Days" {...results.refundPerDays} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Reference Terms</h2>
        <TermsTable terms={FREEDOM_TERMS} showMiles />
      </section>
    </div>
  )
}
