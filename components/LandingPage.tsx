import Link from 'next/link'

interface LandingPageProps {
  isAuthenticated: boolean
}

const features = [
  {
    title: 'Excel-accurate formulas',
    description:
      'Calculations run server-side using the same logic as your Freedom and GAP warranty spreadsheets.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: 'Saved cases',
    description:
      'Store Freedom and GAP scenarios in your account and pick up where you left off on any device.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
  },
  {
    title: 'Smart validation',
    description:
      'Inline warnings flag missing dates, term mismatches, and other input issues before you export results.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
  },
  {
    title: 'Term picker',
    description:
      'Select contract terms from built-in reference tables instead of hunting through spreadsheet tabs.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
  },
  {
    title: 'Freedom advisor',
    description:
      'Compare mileage-based and per-diem refund methods and see which approach yields the better outcome.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-2.25v3.75"
        />
      </svg>
    ),
  },
  {
    title: 'Export results',
    description:
      'Copy formatted summaries to your clipboard or download them for client files and internal review.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
    ),
  },
]

const calculators = [
  {
    name: 'Freedom',
    tagline: 'Vehicle service contract refunds',
    points: [
      'Prorated profit for dealer and client',
      'Mileage vs. per-diem comparison',
      'Cancellation and contract date tracking',
    ],
    accent: 'from-blue-600 to-blue-700',
  },
  {
    name: 'GAP',
    tagline: 'Guaranteed asset protection refunds',
    points: [
      'Term-based proration calculations',
      'Finance amount and cancellation inputs',
      'Clear dealer and client refund split',
    ],
    accent: 'from-slate-700 to-slate-800',
  },
]

const steps = [
  { step: '1', title: 'Sign in', description: 'Access your secure workspace with email and password.' },
  { step: '2', title: 'Enter case details', description: 'Fill in contract dates, amounts, and term selections.' },
  { step: '3', title: 'Review & export', description: 'Validate results, save the case, and share the summary.' },
]

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  const primaryHref = isAuthenticated ? '/app' : '/login'
  const primaryLabel = isAuthenticated ? 'Open calculators' : 'Sign in to start'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              RC
            </div>
            <span className="font-semibold text-slate-900">Refund Calculators</span>
          </div>
          <nav className="flex items-center gap-3">
            <a href="#features" className="hidden text-sm text-slate-600 hover:text-slate-900 sm:inline">
              Features
            </a>
            <a href="#calculators" className="hidden text-sm text-slate-600 hover:text-slate-900 sm:inline">
              Calculators
            </a>
            {isAuthenticated ? (
              <Link
                href="/app"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Open app
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-white" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-slate-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Freedom &amp; GAP warranty refund tools
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Calculate warranty refunds with confidence
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              A purpose-built workspace for Freedom and GAP refund calculations — matching your Excel
              workflows with validation, saved cases, and one-click exports.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href={primaryHref}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                {primaryLabel}
              </Link>
              <a
                href="#calculators"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                See calculators
              </a>
            </div>
          </div>

          <dl className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              { label: 'Calculators', value: '2' },
              { label: 'Server-side accuracy', value: '100%' },
              { label: 'Per-user saved cases', value: 'Unlimited' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm"
              >
                <dt className="text-sm text-slate-500">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="calculators" className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900">Two calculators, one platform</h2>
            <p className="mt-3 text-slate-600">
              Switch between Freedom and GAP workflows without leaving the app. Each calculator mirrors
              the structure and outputs you rely on today.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {calculators.map((calc) => (
              <article
                key={calc.name}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
              >
                <div className={`bg-gradient-to-r ${calc.accent} px-6 py-5`}>
                  <h3 className="text-xl font-bold text-white">{calc.name}</h3>
                  <p className="mt-1 text-sm text-white/80">{calc.tagline}</p>
                </div>
                <ul className="space-y-3 px-6 py-6">
                  {calc.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-slate-200 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900">Built for real refund workflows</h2>
            <p className="mt-3 text-slate-600">
              Everything you need to move from spreadsheet tabs to a reliable, shareable calculation
              process.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <li key={item.step} className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-slate-200 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-12 text-center shadow-lg sm:px-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to run your next refund?</h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Sign in to access Freedom and GAP calculators, save cases, and export results in seconds.
            </p>
            <Link
              href={primaryHref}
              className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              {primaryLabel}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p>Refund Calculators — Freedom &amp; GAP warranty tools</p>
          <div className="flex gap-6">
            <Link href={primaryHref} className="hover:text-slate-700">
              {isAuthenticated ? 'App' : 'Sign in'}
            </Link>
            <a href="#features" className="hover:text-slate-700">
              Features
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}