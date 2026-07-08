import type { AuthContext } from './api-auth'
import { buildRecordSnapshot } from './calculate-snapshot'
import { createCase } from './db'
import type { FreedomInputs } from './calculators/freedom'
import type { GapInputs } from './calculators/gap'
import { getRecordNotificationRecipients, sendRecordCreatedEmail } from './email'
import type { CaseType, SavedCase } from './storage'

export async function persistCalculation(
  ctx: AuthContext,
  contractNumber: string,
  type: CaseType,
  inputs: FreedomInputs | GapInputs,
): Promise<SavedCase> {
  const snapshot = buildRecordSnapshot(type, inputs)
  const saved = await createCase(ctx.userId, contractNumber, type, inputs, snapshot, contractNumber)

  void sendRecordCreatedEmail({
    to: getRecordNotificationRecipients(ctx.email),
    createdByEmail: ctx.email,
    name: contractNumber,
    type: saved.type,
    inputs: saved.inputs,
    results: snapshot.results,
    recommendation: snapshot.recommendation,
    recordId: saved.id,
  }).catch((error) => console.error('Record email error:', error))

  return saved
}