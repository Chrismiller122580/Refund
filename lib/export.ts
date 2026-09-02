import * as XLSX from 'xlsx'
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
    ...(inputs.agentId || inputs.agentName || inputs.agentPercent
      ? [
          line('Agent ID', inputs.agentId || '—'),
          line('Agent Name', inputs.agentName || '—'),
          line('Agent %', `${inputs.agentPercent}%`),
          line('Agent Original Commission', formatCurrency(results.agentOriginalCommission)),
        ]
      : []),
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
          ...(inputs.agentPercent
            ? [line('  Agent Chargeback', formatCurrency(results.refundPerMiles.agentChargeback))]
            : []),
        ]),
    '',
    'Refund per Days:',
    line('  Amount Sent to Client', formatCurrency(results.refundPerDays.amountSentToClient)),
    line('  Client Refund to Customer', formatCurrency(results.refundPerDays.clientRefundToCustomer)),
    line('  Total Customer Receives', formatCurrency(results.refundPerDays.totalCustomerReceives)),
    ...(inputs.agentPercent
      ? [line('  Agent Chargeback', formatCurrency(results.refundPerDays.agentChargeback))]
      : []),
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
    ...(inputs.agentId || inputs.agentName || inputs.agentPercent
      ? [
          line('Agent ID', inputs.agentId || '—'),
          line('Agent Name', inputs.agentName || '—'),
          line('Agent %', `${inputs.agentPercent}%`),
          line('Agent Original Commission', formatCurrency(results.agentOriginalCommission)),
        ]
      : []),
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
    ...(inputs.agentPercent
      ? [line('  Agent Chargeback', formatCurrency(results.refund.agentChargeback))]
      : []),
  ]

  rows.push(...warningLines(warnings))
  return rows.join('\n')
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

export function downloadTextFile(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  const data = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  anchor.click()
  URL.revokeObjectURL(url)
}

type SheetRow = [string, string | number | boolean | null]

function sectionHeader(title: string): SheetRow[] {
  return [[title, ''], ['', '']]
}

function kv(label: string, value: string | number | boolean | null | undefined): SheetRow {
  if (value === undefined || value === null || value === '') return [label, '']
  return [label, value]
}

function autoWidth(rows: SheetRow[]): XLSX.ColInfo[] {
  const maxLabel = Math.max(12, ...rows.map((r) => String(r[0] ?? '').length))
  const maxValue = Math.max(12, ...rows.map((r) => String(r[1] ?? '').length))
  return [{ wch: Math.min(maxLabel + 2, 40) }, { wch: Math.min(maxValue + 2, 48) }]
}

export function downloadFreedomExcel(
  inputs: FreedomInputs,
  results: FreedomResults,
  warnings: ValidationWarning[],
  recommendation?: FreedomRecommendation,
  termLabel?: string,
  filename = `freedom-refund-${new Date().toISOString().slice(0, 10)}.xlsx`,
) {
  const unlimited = inputs.unlimitedMileage
  const rows: SheetRow[] = [
    ['VSC Refund Calculator', ''],
    kv('Generated', new Date().toLocaleString()),
    kv('Contract Term', termLabel ?? 'Custom'),
    kv('Unlimited Mileage', unlimited ? 'Yes' : 'No'),
    ['', ''],
    ...sectionHeader('Contract Inputs'),
    ...(unlimited
      ? []
      : [
          kv('Start Mileage', inputs.startMileage),
          kv('End Mileage', inputs.endMileage),
          kv('Contract Term Miles', inputs.contractTermMiles),
        ]),
    kv('Contract Term Days', inputs.contractTermDays),
    kv('Start Date', inputs.startDate),
    kv('End Date', inputs.endDate),
    kv('Cost', inputs.cost),
    kv('Mark Up', inputs.markup),
    kv('Deductible', inputs.deductible),
    kv('Approved Claim Amount', inputs.approvedClaimAmount),
    ...(inputs.agentId || inputs.agentName || inputs.agentPercent
      ? [
          kv('Agent ID', inputs.agentId || '—'),
          kv('Agent Name', inputs.agentName || '—'),
          kv('Agent %', inputs.agentPercent),
          kv('Agent Original Commission', results.agentOriginalCommission),
        ]
      : []),
    ['', ''],
    ...sectionHeader('Derived Values'),
    ...(unlimited
      ? [kv('Days Used', results.daysUsed)]
      : [
          kv('Mile Cap', results.mileCap),
          kv('Miles Driven', results.milesDriven),
          kv('Days Used', results.daysUsed),
          kv('Mileage Per Day', results.miles.mileagePerDay),
          kv('Cost Per Mile', results.miles.costPerMile),
          kv('Our % (Miles)', results.miles.ourPercent),
          kv('FW Prorated Profit (Miles)', results.miles.fwProratedProfit),
          kv('Client Prorated Profit (Miles)', results.miles.clientProratedProfit),
        ]),
    kv('Days Per Diem', results.days.daysPerDiem),
    kv('Our % (Days)', results.days.ourPercent),
    kv('FW Prorated Profit (Days)', results.days.fwProratedProfit),
    kv('Client Prorated Profit (Days)', results.days.clientProratedProfit),
  ]

  if (!unlimited) {
    rows.push(
      ['', ''],
      ...sectionHeader('Refund per Miles'),
      kv('Amount Sent to Client', results.refundPerMiles.amountSentToClient),
      kv('Client Refund to Customer', results.refundPerMiles.clientRefundToCustomer),
      kv('Total Customer Receives', results.refundPerMiles.totalCustomerReceives),
    )
    if (inputs.agentPercent) {
      rows.push(kv('Agent Chargeback', results.refundPerMiles.agentChargeback))
    }
  }

  rows.push(
    ['', ''],
    ...sectionHeader('Refund per Days'),
    kv('Amount Sent to Client', results.refundPerDays.amountSentToClient),
    kv('Client Refund to Customer', results.refundPerDays.clientRefundToCustomer),
    kv('Total Customer Receives', results.refundPerDays.totalCustomerReceives),
  )
  if (inputs.agentPercent) {
    rows.push(kv('Agent Chargeback', results.refundPerDays.agentChargeback))
  }

  if (recommendation) {
    rows.push(
      ['', ''],
      ...sectionHeader('Recommendation'),
      kv('Recommended Path', recommendation.recommended),
      kv('Message', recommendation.message),
      kv('Miles Total', recommendation.milesTotal),
      kv('Days Total', recommendation.daysTotal),
      kv('Difference', recommendation.difference),
    )
  }

  if (warnings.length > 0) {
    rows.push(['', ''], ...sectionHeader('Warnings'))
    for (const w of warnings) {
      rows.push([`[${w.severity.toUpperCase()}] ${w.message}`, w.field ?? ''])
    }
  }

  const sheet = XLSX.utils.aoa_to_sheet([['Field', 'Value'], ...rows])
  sheet['!cols'] = autoWidth([['Field', 'Value'], ...rows])

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Refund Summary')
  downloadWorkbook(workbook, filename)
}

export function downloadGapExcel(
  inputs: GapInputs,
  results: GapResults,
  warnings: ValidationWarning[],
  termLabel?: string,
  filename = `gap-refund-${new Date().toISOString().slice(0, 10)}.xlsx`,
) {
  const rows: SheetRow[] = [
    ['Gap Refund Calculator', ''],
    kv('Generated', new Date().toLocaleString()),
    kv('Contract Term', termLabel ?? 'Custom'),
    ['', ''],
    ...sectionHeader('Contract Inputs'),
    kv('Contract Term Days', inputs.contractTermDays),
    kv('Start Date', inputs.startDate),
    kv('End Date', inputs.endDate),
    kv('FW Cost', inputs.fwCost),
    kv('Retail Cost', inputs.retailCost),
    kv('Deductible', inputs.deductible),
    kv('Approved Claim Amount', inputs.approvedClaimAmount),
    ...(inputs.agentId || inputs.agentName || inputs.agentPercent
      ? [
          kv('Agent ID', inputs.agentId || '—'),
          kv('Agent Name', inputs.agentName || '—'),
          kv('Agent %', inputs.agentPercent),
          kv('Agent Original Commission', results.agentOriginalCommission),
        ]
      : []),
    ['', ''],
    ...sectionHeader('Derived Values'),
    kv('Days Used', results.daysUsed),
    kv('Days Per Diem', results.prorated.daysPerDiem),
    kv('Our %', results.prorated.ourPercent),
    kv('FW Prorated Profit', results.prorated.fwProratedProfit),
    kv('Client Prorated Profit', results.prorated.clientProratedProfit),
    ['', ''],
    ...sectionHeader('Refund per Days'),
    kv('Amount Sent to Client', results.refund.amountSentToClient),
    kv('Client Refund to Customer', results.refund.clientRefundToCustomer),
    kv('Total Customer Receives', results.refund.totalCustomerReceives),
  ]

  if (inputs.agentPercent) {
    rows.push(kv('Agent Chargeback', results.refund.agentChargeback))
  }

  if (warnings.length > 0) {
    rows.push(['', ''], ...sectionHeader('Warnings'))
    for (const w of warnings) {
      rows.push([`[${w.severity.toUpperCase()}] ${w.message}`, w.field ?? ''])
    }
  }

  const sheet = XLSX.utils.aoa_to_sheet([['Field', 'Value'], ...rows])
  sheet['!cols'] = autoWidth([['Field', 'Value'], ...rows])

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Refund Summary')
  downloadWorkbook(workbook, filename)
}
