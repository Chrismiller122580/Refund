import type { ReactNode } from 'react'
import Link from 'next/link'
import { PUBLIC_API_SECTIONS } from '@/lib/public-api-docs'
import { logoMarkClass, panelClass, stickyHeaderClass } from '@/lib/ui-classes'
import { ThemeToggle } from './ThemeToggle'

function renderMarkdownBlock(text: string) {
  const lines = text.split('\n')
  const elements: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i += 1
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i += 1
      }
      i += 1
      elements.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>,
      )
      continue
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={key++} className="mt-6 text-base font-semibold text-slate-900 dark:text-slate-100">
          {line.slice(4)}
        </h4>,
      )
      i += 1
      continue
    }

    if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i += 1
      }
      const rows = tableLines
        .filter((row) => !row.includes('---'))
        .map((row) => row.split('|').slice(1, -1).map((cell) => cell.trim()))
      if (rows.length > 0) {
        const [header, ...body] = rows
        elements.push(
          <div key={key++} className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {header.map((cell) => (
                    <th key={cell} className="px-3 py-2 font-medium text-slate-600 dark:text-slate-300">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-slate-100 dark:border-slate-800">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 text-slate-800 dark:text-slate-200">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )
      }
      continue
    }

    if (line.trim()) {
      elements.push(
        <p key={key++} className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {line}
        </p>,
      )
    }
    i += 1
  }

  return <div className="space-y-3">{elements}</div>
}

interface PublicApiDocsProps {
  baseUrl?: string
  showSignInLink?: boolean
}

export function PublicApiDocs({ baseUrl, showSignInLink = true }: PublicApiDocsProps) {
  const resolvedBase = baseUrl ?? 'https://your-deployment-url'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className={stickyHeaderClass}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className={logoMarkClass}>RC</span>
            <span className="font-semibold">Refund Calculators</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {showSignInLink && (
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Integrator documentation
          </p>
          <h1 className="mt-2 text-3xl font-bold">Refund API</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Public reference for connecting external systems. Sign in after receiving credentials
            from your administrator for setup instructions and your deployment URL.
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
            Base URL: <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">{resolvedBase}</code>
          </p>
        </div>

        <nav className="mb-8 flex flex-wrap gap-2">
          {PUBLIC_API_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:text-blue-300"
            >
              {section.title}
            </a>
          ))}
        </nav>

        <div className="space-y-6">
          {PUBLIC_API_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className={panelClass}>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
              <div className="mt-4">{renderMarkdownBlock(section.content.replaceAll('$BASE_URL', resolvedBase))}</div>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Need an API key?</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            API keys are provisioned by your administrator. Sign in to view step-by-step setup
            instructions for your account.
          </p>
          {showSignInLink && (
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign in for setup guide
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}