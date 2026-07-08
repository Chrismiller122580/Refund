import type { FreedomInputs, FreedomResults } from './calculators/freedom'
import type { GapInputs, GapResults } from './calculators/gap'
import type { FreedomRecommendation } from './calculators/recommendation'
import type { ValidationWarning } from './calculators/validation'
import { formatCurrency, formatPercent } from './format'

function line(label: string, value: string) {
  return `${label}: ${value}`
}

function warningLines(warnings: ValidationWarning[]) {
  if (warnings.length === 0) return []
  return ['', 'Warnings:', ...warnings.map((w) => `  [${w.severity.toUpperCase()}] ${w.message}`)]
}

export function formatFreedomSummary(
  inputs: FreedomInputs,
  results: FreedomResults,
  warnings: ValidationWarning[],
  recommendation?: FreedomRecommendation,
  termLabel?: string,
): string {
  const unlimited = inputs.unlimitedMileage
  const rows = [
    'VSC REFUND CALCULATOR SUMMARY',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    line('Contract Term', termLabel ?? 'Custom'),
    line('Unlimited Mileage', unlimited ? 'Yes' : 'No'),
    ...(unlimited
      ? []
      : [
          line('Start Mileage', inputs.startMileage.toLocaleString()),
          line('End Mileage', inputs.endMileage.toLocaleString()),
          line('Contract Term Miles', inputs.contractTermMiles.toLocaleString()),
        ]),
    line('Contract Term Days', String(inputs.contractTermDays)),
    line('Start Date', inputs.startDate),
    line('End Date', inputs.endDate),
    line('Cost', formatCurrency(inputs.cost)),
    line('Mark Up', formatCurrency(inputs.markup)),
    line('Deductible', formatCurrency(inputs.deductible)),
    line('Approved Claim', formatCurrency(inputs.approvedClaimAmount)),
    '',
    'Derived Values:',
    ...(unlimited
      ? [line('  Days Used', String(results.daysUsed))]
      : [
          line('  Mile Cap', results.mileCap.toLocaleString()),
          line('  Miles Driven', results.milesDriven.toLocaleString()),
          line('  Days Used', String(results.daysUsed)),
        ]),
    ...(unlimited
      ? []
      : [
          '',
          'Refund per Miles:',
          line('  Amount Sent to Client', formatCurrency(results.refundPerMiles.amountSentToClient)),
          line('  Client Refund to Customer', formatCurrency(results.refundPerMiles.clientRefundToCustomer)),
          line('  Total Customer Receives', formatCurrency(results.refundPerMiles.totalCustomerReceives)),
        ]),
    '',
    'Refund per Days:',
    line('  Amount Sent to Client', formatCurrency(results.refundPerDays.amountSentToClient)),
    line('  Client Refund to Customer', formatCurrency(results.refundPerDays.clientRefundToCustomer)),
    line('  Total Customer Receives', formatCurrency(results.refundPerDays.totalCustomerReceives)),
  ]

  if (recommendation) {
    rows.push('', `Recommendation: ${recommendation.message}`)
  }

  rows.push(...warningLines(warnings))
  return rows.join('\n')
}

export function formatGapSummary(
  inputs: GapInputs,
  results: GapResults,
  warnings: ValidationWarning[],
  termLabel?: string,
): string {
  const rows = [
    'Gap REFUND CALCULATOR SUMMARY',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    line('Contract Term', termLabel ?? 'Custom'),
    line('Contract Term Days', String(inputs.contractTermDays)),
    line('Start Date', inputs.startDate),
    line('End Date', inputs.endDate),
    line('FW Cost', formatCurrency(inputs.fwCost)),
    line('Retail Cost', formatCurrency(inputs.retailCost)),
    line('Deductible', formatCurrency(inputs.deductible)),
    line('Approved Claim', formatCurrency(inputs.approvedClaimAmount)),
    '',
    'Derived Values:',
    line('  Days Used', String(results.daysUsed)),
    line('  Days Per Diem', formatCurrency(results.prorated.daysPerDiem)),
    line('  Our %', formatPercent(results.prorated.ourPercent)),
    '',
    'Refund per Days:',
    line('  Amount Sent to Client', formatCurrency(results.refund.amountSentToClient)),
    line('  Client Refund to Customer', formatCurrency(results.refund.clientRefundToCustomer)),
    line('  Total Customer Receives', formatCurrency(results.refund.totalCustomerReceives)),
  ]

  rows.push(...warningLines(warnings))
  return rows.join('\n')
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

export function downloadTextFile(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
