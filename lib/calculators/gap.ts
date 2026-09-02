import { datedifDays } from './dateUtils'

export interface GapInputs {
  contractTermDays: number
  startDate: string
  endDate: string
  fwCost: number
  retailCost: number
  deductible: number
  approvedClaimAmount: number
  /** Agent / agency identifier for chargeback tracking */
  agentId: string
  /** Agent name for chargeback tracking */
  agentName: string
  /** Agent commission rate in percent points (e.g. 10 = 10%) */
  agentPercent: number
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
  /** Pro-rated agent commission chargeback on unearned dealer cost */
  agentChargeback: number
}

export interface GapResults {
  daysUsed: number
  prorated: GapProratedBreakdown
  refund: GapRefundBreakdown
  /** Original full agent commission (fwCost × agent%) before proration */
  agentOriginalCommission: number
}

/** Agent chargeback = dealer cost × agent% × (1 − ourPercent) */
function agentChargeback(cost: number, agentPercent: number, ourPercent: number): number {
  if (!cost || !agentPercent) return 0
  const rate = agentPercent / 100
  const unearned = Math.max(0, 1 - ourPercent)
  return cost * rate * unearned
}

export function calculateGap(inputs: GapInputs): GapResults {
  const daysUsed = datedifDays(inputs.startDate, inputs.endDate)
  const daysPerDiem = inputs.fwCost / inputs.contractTermDays
  const fwProratedProfit = daysPerDiem * daysUsed
  const ourPercent = inputs.fwCost ? fwProratedProfit / inputs.fwCost : 0
  const clientProratedProfit = ourPercent * inputs.retailCost
  const agentOriginalCommission =
    inputs.fwCost && inputs.agentPercent ? inputs.fwCost * (inputs.agentPercent / 100) : 0

  const deductions = inputs.deductible + inputs.approvedClaimAmount

  const refund: GapRefundBreakdown = {
    amountSentToClient: inputs.fwCost - fwProratedProfit - deductions,
    clientRefundToCustomer: inputs.retailCost - clientProratedProfit,
    totalCustomerReceives: 0,
    agentChargeback: agentChargeback(inputs.fwCost, inputs.agentPercent, ourPercent),
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
    agentOriginalCommission,
  }
}

export const DEFAULT_GAP_INPUTS: GapInputs = {
  contractTermDays: 0,
  startDate: '',
  endDate: '',
  fwCost: 0,
  retailCost: 0,
  deductible: 0,
  approvedClaimAmount: 0,
  agentId: '',
  agentName: '',
  agentPercent: 0,
}

/** Sample data from the Excel workbook — used in tests only */
export const EXAMPLE_GAP_INPUTS: GapInputs = {
  contractTermDays: 1825,
  startDate: '2023-03-04',
  endDate: '2026-02-27',
  fwCost: 103,
  retailCost: 855,
  deductible: 50,
  approvedClaimAmount: 0,
  agentId: '',
  agentName: '',
  agentPercent: 0,
}
