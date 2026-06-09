import { differenceInDays, parseISO } from 'date-fns'

/** Excel DATEDIF(start, end, "d") — whole days between dates */
export function datedifDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  return Math.max(0, differenceInDays(end, start))
}
