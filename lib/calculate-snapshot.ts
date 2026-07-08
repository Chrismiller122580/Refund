import { calculateFreedom, type FreedomInputs } from './calculators/freedom'
import { calculateGap, type GapInputs } from './calculators/gap'
import { getFreedomRecommendation } from './calculators/recommendation'
import { validateFreedomInputs, validateGapInputs } from './calculators/validation'
import type { RecordSnapshotData } from './db'
import type { CaseType } from './storage'

export function buildRecordSnapshot(
  type: CaseType,
  inputs: FreedomInputs | GapInputs,
): RecordSnapshotData {
  if (type === 'freedom') {
    const freedomInputs = inputs as FreedomInputs
    const results = calculateFreedom(freedomInputs)
    const warnings = validateFreedomInputs(freedomInputs, results)
    const recommendation = getFreedomRecommendation(results, warnings, freedomInputs)
    return { results, warnings, recommendation }
  }

  const gapInputs = inputs as GapInputs
  const results = calculateGap(gapInputs)
  const warnings = validateGapInputs(gapInputs, results)
  return { results, warnings }
}