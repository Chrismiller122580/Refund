import type { FreedomInputs, FreedomResults } from './freedom'
import type { GapInputs, GapResults } from './gap'

export type WarningSeverity = 'error' | 'warning' | 'info'

export interface ValidationWarning {
  id: string
  severity: WarningSeverity
  message: string
  field?: string
}

function add(warnings: ValidationWarning[], warning: ValidationWarning) {
  warnings.push(warning)
}

function validateDates(
  startDate: string,
  endDate: string,
  warnings: ValidationWarning[],
) {
  if (!startDate || !endDate) {
    add(warnings, {
      id: 'missing-dates',
      severity: 'error',
      message: 'Start and end dates are required.',
      field: !startDate ? 'startDate' : 'endDate',
    })
    return
  }

  if (startDate > endDate) {
    add(warnings, {
      id: 'invalid-date-range',
      severity: 'error',
      message: 'End date must be on or after the start date.',
      field: 'endDate',
    })
  }
}

function validateContractTermDays(
  contractTermDays: number,
  warnings: ValidationWarning[],
) {
  if (contractTermDays <= 0) {
    add(warnings, {
      id: 'invalid-contract-term-days',
      severity: 'error',
      message: 'Contract term days must be greater than zero.',
      field: 'contractTermDays',
    })
  }
}

function validateNegativeRefund(
  id: string,
  label: string,
  total: number,
  warnings: ValidationWarning[],
) {
  if (total < 0) {
    add(warnings, {
      id,
      severity: 'warning',
      message: `${label} total is negative (${total.toFixed(2)}). Review inputs before proceeding.`,
    })
  }
}

export function validateFreedomInputs(
  inputs: FreedomInputs,
  results: FreedomResults,
): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  validateDates(inputs.startDate, inputs.endDate, warnings)
  validateContractTermDays(inputs.contractTermDays, warnings)

  if (!inputs.unlimitedMileage) {
    if (inputs.contractTermMiles <= 0) {
      add(warnings, {
        id: 'invalid-contract-term-miles',
        severity: 'error',
        message: 'Contract term miles must be greater than zero.',
        field: 'contractTermMiles',
      })
    }

    if (inputs.endMileage < inputs.startMileage) {
      add(warnings, {
        id: 'negative-miles-driven',
        severity: 'error',
        message: 'End mileage cannot be less than start mileage.',
        field: 'endMileage',
      })
    }

    if (inputs.endMileage > results.mileCap) {
      add(warnings, {
        id: 'mile-cap-exceeded',
        severity: 'warning',
        message: `End mileage (${inputs.endMileage.toLocaleString()}) exceeds the mile cap (${results.mileCap.toLocaleString()}).`,
        field: 'endMileage',
      })
    }
  }

  if (inputs.cost <= 0) {
    add(warnings, {
      id: 'invalid-cost',
      severity: 'warning',
      message: 'Cost should be greater than zero.',
      field: 'cost',
    })
  }

  if (inputs.markup <= 0) {
    add(warnings, {
      id: 'invalid-markup',
      severity: 'warning',
      message: 'Mark up should be greater than zero.',
      field: 'markup',
    })
  }

  if (!inputs.unlimitedMileage) {
    validateNegativeRefund(
      'negative-refund-miles',
      'Refund per Miles',
      results.refundPerMiles.totalCustomerReceives,
      warnings,
    )
  }
  validateNegativeRefund(
    'negative-refund-days',
    'Refund per Days',
    results.refundPerDays.totalCustomerReceives,
    warnings,
  )

  return warnings
}

export function validateGapInputs(
  inputs: GapInputs,
  results: GapResults,
): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  validateDates(inputs.startDate, inputs.endDate, warnings)
  validateContractTermDays(inputs.contractTermDays, warnings)

  if (inputs.fwCost <= 0) {
    add(warnings, {
      id: 'invalid-fw-cost',
      severity: 'warning',
      message: 'FW cost should be greater than zero.',
      field: 'fwCost',
    })
  }

  if (inputs.retailCost <= 0) {
    add(warnings, {
      id: 'invalid-retail-cost',
      severity: 'warning',
      message: 'Retail cost should be greater than zero.',
      field: 'retailCost',
    })
  }

  if (inputs.retailCost > 0 && inputs.fwCost > 0 && inputs.retailCost < inputs.fwCost) {
    add(warnings, {
      id: 'retail-below-fw-cost',
      severity: 'info',
      message: 'Retail cost is less than FW cost. Confirm values from the Classic breakdown sheet.',
      field: 'retailCost',
    })
  }

  validateNegativeRefund(
    'negative-refund-gap',
    'Refund per Days',
    results.refund.totalCustomerReceives,
    warnings,
  )

  return warnings
}

export function warningsForField(
  warnings: ValidationWarning[],
  field: string,
): ValidationWarning[] {
  return warnings.filter((w) => w.field === field)
}

export function hasFieldError(
  warnings: ValidationWarning[],
  field: string,
): boolean {
  return warningsForField(warnings, field).some((w) => w.severity === 'error')
}
