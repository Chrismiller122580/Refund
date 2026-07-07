export interface TermRow {
  label: string
  months: number
  miles?: number
  days: number
}

export const FREEDOM_TERMS: TermRow[] = [
  { label: '3 Months', months: 3, miles: 3000, days: 90 },
  { label: '6 Months', months: 6, miles: 6000, days: 180 },
  { label: '12 Months', months: 12, miles: 15000, days: 365 },
  { label: '24 Months', months: 24, miles: 30000, days: 730 },
  { label: '36 Months', months: 36, miles: 50000, days: 1095 },
  { label: '48 Months', months: 48, miles: 70000, days: 1460 },
  { label: '60 Months', months: 60, miles: 100000, days: 1825 },
  { label: '72 Months', months: 72, miles: 100000, days: 2190 },
  { label: '84 Months', months: 84, miles: 100000, days: 2555 },
]

export const GAP_TERMS: TermRow[] = FREEDOM_TERMS.map(({ label, months, days }) => ({
  label,
  months,
  days,
}))

export const CUSTOM_TERM_LABEL = 'Custom'

export function matchFreedomTerm(miles: number, days: number): string {
  const match = FREEDOM_TERMS.find((t) => t.miles === miles && t.days === days)
  return match?.label ?? CUSTOM_TERM_LABEL
}

export function matchFreedomTermByDays(days: number): string {
  const match = FREEDOM_TERMS.find((t) => t.days === days)
  return match?.label ?? CUSTOM_TERM_LABEL
}

export function matchGapTerm(days: number): string {
  const match = GAP_TERMS.find((t) => t.days === days)
  return match?.label ?? CUSTOM_TERM_LABEL
}

export function getFreedomTerm(label: string): TermRow | undefined {
  return FREEDOM_TERMS.find((t) => t.label === label)
}

export function getGapTerm(label: string): TermRow | undefined {
  return GAP_TERMS.find((t) => t.label === label)
}
