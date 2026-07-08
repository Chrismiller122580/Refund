import { formatRecordSummary } from './records'
import type { FreedomInputs, FreedomResults } from './calculators/freedom'
import type { GapInputs, GapResults } from './calculators/gap'
import type { FreedomRecommendation } from './calculators/recommendation'
import type { CaseType } from './storage'

interface RecordEmailParams {
  to: string[]
  createdByEmail: string
  name: string
  type: CaseType
  inputs: FreedomInputs | GapInputs
  results: FreedomResults | GapResults
  recommendation?: FreedomRecommendation
  recordId: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export async function sendRecordCreatedEmail(params: RecordEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) {
    console.warn('Email not configured (RESEND_API_KEY / EMAIL_FROM). Skipping notification.')
    return false
  }

  const recipients = [...new Set(params.to.filter(Boolean))]
  if (recipients.length === 0) return false

  const summary = formatRecordSummary(
    params.name,
    params.type,
    params.inputs,
    params.results,
    params.recommendation,
  )
  const appUrl = process.env.APP_URL ?? 'https://refund-mocha-psi.vercel.app'
  const subject = `New ${params.type.toUpperCase()} record: ${params.name}`
  const html = `
    <h2>New refund record saved</h2>
    <p><strong>Created by:</strong> ${escapeHtml(params.createdByEmail)}</p>
    <pre style="font-family:monospace;background:#f8fafc;padding:12px;border-radius:8px">${escapeHtml(summary)}</pre>
    <p><a href="${escapeHtml(appUrl)}/app">Open Refund Calculators</a></p>
    <p style="color:#64748b;font-size:12px">Record ID: ${escapeHtml(params.recordId)}</p>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      html,
      text: `${summary}\n\nCreated by: ${params.createdByEmail}\nRecord ID: ${params.recordId}`,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('Failed to send record email:', res.status, body)
    return false
  }

  return true
}

export function getRecordNotificationRecipients(creatorEmail: string): string[] {
  const notify = process.env.NOTIFY_EMAIL
  const recipients = [creatorEmail]
  if (notify && notify !== creatorEmail) recipients.push(notify)
  return recipients
}