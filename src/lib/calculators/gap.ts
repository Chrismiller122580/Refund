import { datedifDays } from './dateUtils'

export interface GapInputs {
  contractTermDays: number
  startDate: string
  endDate: string
  fwCost: number
  retailCost: number
  deductible: number
  approvedClaimAmount: number
}

export interface GapProratedBreakdown {
  daysPerDiem: number
  ourPercent: number
  fwProratedProfit: number
  clientProratedProfit: number
}

export interface GapRefundBreakdown {
  amountSentToClient: number
  clientRefundToCustomer: number
  totalCustomerReceives: number
}

export interface GapResults {
  daysUsed: number
  prorated: GapProratedBreakdown
  refund: GapRefundBreakdown
}

export function calculateGap(inputs: GapInputs): GapResults {
  const daysUsed = datedifDays(inputs.startDate, inputs.endDate)
  const daysPerDiem = inputs.fwCost / inputs.contractTermDays
  const fwProratedProfit = daysPerDiem * daysUsed
  const ourPercent = fwProratedProfit / inputs.fwCost
  const clientProratedProfit = ourPercent * inputs.retailCost

  const deductions = inputs.deductible + inputs.approvedClaimAmount

  const refund: GapRefundBreakdown = {
    amountSentToClient: inputs.fwCost - fwProratedProfit - deductions,
    clientRefundToCustomer: inputs.retailCost - clientProratedProfit,
    totalCustomerReceives: 0,
  }
  refund.totalCustomerReceives =
    refund.amountSentToClient + refund.clientRefundToCustomer

  return {
    daysUsed,
    prorated: {
      daysPerDiem,
      ourPercent,
      fwProratedProfit,
      clientProratedProfit,
    },
    refund,
  }
}

export const DEFAULT_GAP_INPUTS: GapInputs = {
  contractTermDays: 1825,
  startDate: '2023-03-04',
  endDate: '2026-02-27',
  fwCost: 103,
  retailCost: 855,
  deductible: 50,
  approvedClaimAmount: 0,
}
