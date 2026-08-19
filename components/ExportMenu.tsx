'use client'

import { useState } from 'react'
import { copyToClipboard, downloadTextFile } from '@/lib/export'
import { secondaryButtonClass } from '@/lib/ui-classes'

interface ExportMenuProps {
  getSummary: () => string
  /** Base filename without extension, e.g. freedom-refund-2026-08-19 */
  filename: string
  /** Optional Excel download handler (wired from calculator with structured data) */
  onDownloadExcel?: () => void
  /** Disable all actions when there is nothing to export */
  disabled?: boolean
}

export function ExportMenu({ getSummary, filename, onDownloadExcel, disabled }: ExportMenuProps) {
  const [status, setStatus] = useState<string | null>(null)

  const flash = (message: string) => {
    setStatus(message)
    setTimeout(() => setStatus(null), 2000)
  }

  const run = async (action: 'copy' | 'txt' | 'excel') => {
    if (disabled) return

    if (action === 'copy') {
      const text = getSummary()
      if (!text) {
        flash('Nothing to export')
        return
      }
      await copyToClipboard(text)
      flash('Copied to clipboard')
      return
    }

    if (action === 'txt') {
      const text = getSummary()
      if (!text) {
        flash('Nothing to export')
        return
      }
      const name = filename.endsWith('.txt') ? filename : `${filename.replace(/\.xlsx$/i, '')}.txt`
      downloadTextFile(text, name)
      flash('Text download started')
      return
    }

    if (action === 'excel') {
      if (!onDownloadExcel) {
        flash('Excel export unavailable')
        return
      }
      onDownloadExcel()
      flash('Excel download started')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Export:</span>
      <button
        type="button"
        onClick={() => run('copy')}
        disabled={disabled}
        className={secondaryButtonClass}
      >
        Copy Summary
      </button>
      <button
        type="button"
        onClick={() => run('txt')}
        disabled={disabled}
        className={secondaryButtonClass}
      >
        Download TXT
      </button>
      {onDownloadExcel && (
        <button
          type="button"
          onClick={() => run('excel')}
          disabled={disabled}
          className={secondaryButtonClass}
        >
          Download Excel
        </button>
      )}
      {status && <span className="text-sm text-emerald-600 dark:text-emerald-400">{status}</span>}
    </div>
  )
}
