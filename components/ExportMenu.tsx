'use client'

import { useState } from 'react'
import { copyToClipboard, downloadTextFile } from '@/lib/export'
import { secondaryButtonClass } from '@/lib/ui-classes'

interface ExportMenuProps {
  getSummary: () => string
  filename: string
}

export function ExportMenu({ getSummary, filename }: ExportMenuProps) {
  const [status, setStatus] = useState<string | null>(null)

  const run = async (action: 'copy' | 'download') => {
    const text = getSummary()
    if (action === 'copy') {
      await copyToClipboard(text)
      setStatus('Copied to clipboard')
    } else {
      downloadTextFile(text, filename)
      setStatus('Download started')
    }
    setTimeout(() => setStatus(null), 2000)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Export:</span>
      <button type="button" onClick={() => run('copy')} className={secondaryButtonClass}>
        Copy Summary
      </button>
      <button type="button" onClick={() => run('download')} className={secondaryButtonClass}>
        Download Report
      </button>
      {status && <span className="text-sm text-emerald-600 dark:text-emerald-400">{status}</span>}
    </div>
  )
}