import { datedifDays } from './dateUtils'

export interface FreedomInputs {
  startMileage: number
  endMileage: number
  contractTermMiles: number
  contractTermDays: number
  startDate: string
  endDate: string
  cost: number
  markup: number
  deductible: number
  approvedClaimAmount: number
}

export interface ProratedBreakdown {
  mileagePerDay: number
  daysPerDiem: number
  costPerMile: number
  ourPercent: number
  fwProratedProfit: number
  clientProratedProfit: number
}

export interface RefundBreakdown {
  amountSentToClient: number
  clientRefundToCustomer: number
  totalCustomerReceives: number
}

export interface FreedomResults {
  mileCap: number
  milesDriven: number
  daysUsed: number
  miles: ProratedBreakdown
  days: ProratedBreakdown
  refundPerMiles: RefundBreakdown
  refundPerDays: RefundBreakdown
}

export function calculateFreedom(inputs: FreedomInputs): FreedomResults {
  const mileCap = inputs.startMileage + inputs.contractTermMiles
  const milesDriven = inputs.endMileage - inputs.startMileage
  const daysUsed = datedifDays(inputs.startDate, inputs.endDate)

  const mileagePerDay = inputs.contractTermMiles / inputs.contractTermDays
  const daysPerDiemMiles = inputs.cost / inputs.contractTermDays
  const costPerMile = daysPerDiemMiles / mileagePerDay
  const fwProratedProfitMiles = costPerMile * milesDriven
  const ourPercentMiles = fwProratedProfitMiles / inputs.cost
  const clientProratedProfitMiles = inputs.markup * ourPercentMiles

  const daysPerDiem = inputs.cost / inputs.contractTermDays
  const fwProratedProfitDays = daysPerDiem * daysUsed
  const ourPercentDays = fwProratedProfitDays / inputs.cost
  const clientProratedProfitDays = ourPercentDays * inputs.markup

  const deductions = inputs.deductible + inputs.approvedClaimAmount

  const refundPerMiles: RefundBreakdown = {
    amountSentToClient: inputs.cost - fwProratedProfitMiles - deductions,
    clientRefundToCustomer: inputs.markup - clientProratedProfitMiles,
    totalCustomerReceives: 0,
  }
  refundPerMiles.totalCustomerReceives =
    refundPerMiles.amountSentToClient + refundPerMiles.clientRefundToCustomer

  const refundPerDays: RefundBreakdown = {
    amountSentToClient: inputs.cost - fwProratedProfitDays - deductions,
    clientRefundToCustomer: inputs.markup - clientProratedProfitDays,
    totalCustomerReceives: 0,
  }
  refundPerDays.totalCustomerReceives =
    refundPerDays.amountSentToClient + refundPerDays.clientRefundToCustomer

  return {
    mileCap,
    milesDriven,
    daysUsed,
    miles: {
      mileagePerDay,
      daysPerDiem: daysPerDiemMiles,
      costPerMile,
      ourPercent: ourPercentMiles,
      fwProratedProfit: fwProratedProfitMiles,
      clientProratedProfit: clientProratedProfitMiles,
    },
    days: {
      mileagePerDay,
      daysPerDiem,
      costPerMile: 0,
      ourPercent: ourPercentDays,
      fwProratedProfit: fwProratedProfitDays,
      clientProratedProfit: clientProratedProfitDays,
    },
    refundPerMiles,
    refundPerDays,
  }
}

export const DEFAULT_FREEDOM_INPUTS: FreedomInputs = {
  startMileage: 0,
  endMileage: 0,
  contractTermMiles: 0,
  contractTermDays: 0,
  startDate: '',
  endDate: '',
  cost: 0,
  markup: 0,
  deductible: 0,
  approvedClaimAmount: 0,
}

/** Sample data from the Excel workbook — used in tests only */
export const EXAMPLE_FREEDOM_INPUTS: FreedomInputs = {
  startMileage: 101520,
  endMileage: 204145,
  contractTermMiles: 5000,
  contractTermDays: 1095,
  startDate: '2024-06-25',
  endDate: '2025-10-29',
  cost: 1928,
  markup: 1050,
  deductible: 50,
  approvedClaimAmount: 0,
}
