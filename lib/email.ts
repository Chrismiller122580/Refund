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

interface ApiKeyEmailParams {
  to: string
  keyName: string
  key: string
  keyPrefix: string
  createdByEmail: string
}

export async function sendApiKeyCreatedEmail(params: ApiKeyEmailParams): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!resendKey || !from) {
    console.warn('Email not configured (RESEND_API_KEY / EMAIL_FROM). Skipping API key email.')
    return false
  }

  if (!params.to.trim()) return false

  const appUrl = process.env.APP_URL ?? 'https://refund-mocha-psi.vercel.app'
  const integrationGuide =
    process.env.INTEGRATION_GUIDE_URL ??
    'https://github.com/Chrismiller122580/Refund/blob/main/docs/COMPANY_INTEGRATION.md'
  const subject = `Your Refund API key: ${params.keyName}`

  const text = [
    'Your Refund Calculators API key has been created.',
    '',
    `Key name: ${params.keyName}`,
    `API key: ${params.key}`,
    `Key prefix: ${params.keyPrefix}`,
    '',
    `Base URL: ${appUrl}`,
    '',
    'Authenticate every request with:',
    `Authorization: Bearer ${params.key}`,
    '',
    'Example:',
    `curl -s -X POST "${appUrl}/api/calculate/freedom" \\`,
    `  -H "Authorization: Bearer ${params.key}" \\`,
    '  -H "Content-Type: application/json" \\',
    '  -d "{ ... }"',
    '',
    `Integration guide: ${integrationGuide}`,
    '',
    `Created by: ${params.createdByEmail}`,
    '',
    'Store this key securely. It cannot be retrieved again after this email.',
  ].join('\n')

  const html = `
    <h2>Your Refund API key</h2>
    <p>An administrator (<strong>${escapeHtml(params.createdByEmail)}</strong>) created an API key for your account.</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:4px 12px 4px 0;color:#64748b">Key name</td><td><strong>${escapeHtml(params.keyName)}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#64748b">Key prefix</td><td><code>${escapeHtml(params.keyPrefix)}</code></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top">API key</td><td><code style="word-break:break-all">${escapeHtml(params.key)}</code></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#64748b">Base URL</td><td><a href="${escapeHtml(appUrl)}">${escapeHtml(appUrl)}</a></td></tr>
    </table>
    <h3>Authentication</h3>
    <p>Send this header on every API request:</p>
    <pre style="font-family:monospace;background:#f8fafc;padding:12px;border-radius:8px">Authorization: Bearer ${escapeHtml(params.key)}</pre>
    <h3>Getting started</h3>
    <ul>
      <li><a href="${escapeHtml(appUrl)}/app">Open Refund Calculators</a></li>
      <li><a href="${escapeHtml(integrationGuide)}">Company integration guide</a> (field reference and workflows)</li>
    </ul>
    <p style="color:#b45309;background:#fffbeb;padding:12px;border-radius:8px;font-size:14px">
      <strong>Important:</strong> Store this key in a secrets manager. It is shown only once and cannot be recovered.
    </p>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject,
      html,
      text,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('Failed to send API key email:', res.status, body)
    return false
  }

  return true
}