import Link from 'next/link'
import { HeroPreview } from './HeroPreview'
import { ThemeToggle } from './ThemeToggle'
import {
  logoMarkClass,
  marketingCardClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionEyebrowClass,
  statCardClass,
  stickyHeaderClass,
} from '@/lib/ui-classes'

interface LandingPageProps {
  isAuthenticated: boolean
}

const features = [
  {
    title: 'Excel-accurate formulas',
    description:
      'Calculations run server-side using the same logic as your VSC and Gap spreadsheets.',
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
      'Store VSC and Gap scenarios in your account and pick up where you left off on any device.',
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
    title: 'VSC advisor',
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
    name: 'VSC',
    tagline: 'Vehicle service contract refunds',
    points: [
      'Prorated profit for dealer and client',
      'Mileage vs. per-diem comparison',
      'Cancellation and contract date tracking',
    ],
    accent: 'from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-800',
  },
  {
    name: 'Gap',
    tagline: 'Guaranteed asset protection refunds',
    points: [
      'Term-based proration calculations',
      'Finance amount and cancellation inputs',
      'Clear dealer and client refund split',
    ],
    accent: 'from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-800',
  },
]

const steps = [
  { step: '1', title: 'Sign in', description: 'Access your secure workspace with email and password.' },
  { step: '2', title: 'Enter case details', description: 'Fill in contract dates, amounts, and term selections.' },
  { step: '3', title: 'Review & export', description: 'Validate results, save the case, and share the summary.' },
]

const stats = [
  {
    label: 'Calculators',
    value: '2',
    icon: (
      <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 0v12m0-12h9.75m-9.75 0v12m0-12h3.75m-3.75 12h9.75" />
      </svg>
    ),
  },
  {
    label: 'Server-side accuracy',
    value: '100%',
    icon: (
      <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Per-user saved cases',
    value: 'Unlimited',
    icon: (
      <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
]

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className={sectionEyebrowClass}>{eyebrow}</p>}
      <h2 className={`text-3xl font-bold text-slate-900 dark:text-slate-100 ${eyebrow ? 'mt-4' : ''}`}>
        {title}
      </h2>
      <p className="mt-3 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  )
}

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  const primaryHref = isAuthenticated ? '/app' : '/login'
  const primaryLabel = isAuthenticated ? 'Open calculators' : 'Sign in to start'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className={stickyHeaderClass}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className={logoMarkClass}>RC</div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Refund Calculators</span>
          </Link>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="#features"
              className="hidden text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 sm:inline"
            >
              Features
            </a>
            <a
              href="#calculators"
              className="hidden text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 sm:inline"
            >
              Calculators
            </a>
            <Link
              href="/docs"
              className="hidden text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 sm:inline"
            >
              API docs
            </Link>
            <Link href={primaryHref} className={primaryButtonClass}>
              {isAuthenticated ? 'Open app' : 'Sign in'}
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute inset-0 bg-grid-subtle" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-900/20" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-slate-200/40 blur-3xl dark:bg-slate-800/30" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={sectionEyebrowClass}>VSC and Gap refund tools</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
                Calculate warranty refunds with confidence
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                A purpose-built workspace for VSC and Gap refund calculations — matching your Excel
                workflows with validation, saved cases, and one-click exports.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href={primaryHref} className={`${primaryButtonClass} px-6 py-3 font-semibold`}>
                  {primaryLabel}
                </Link>
                <a href="#calculators" className={`${secondaryButtonClass} px-6 py-3 font-semibold`}>
                  See calculators
                </a>
              </div>

              <dl className="mt-12 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className={statCardClass}>
                    <div className="flex items-center gap-2">
                      {stat.icon}
                      <dt className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</dt>
                    </div>
                    <dd className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <HeroPreview />
          </div>
        </div>
      </section>

      <section id="calculators" className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionIntro
            eyebrow="Calculators"
            title="Two calculators, one platform"
            description="Switch between VSC and Gap workflows without leaving the app. Each calculator mirrors the structure and outputs you rely on today."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {calculators.map((calc) => (
              <article
                key={calc.name}
                className={`${marketingCardClass} overflow-hidden p-0`}
              >
                <div className={`bg-gradient-to-r ${calc.accent} px-6 py-5`}>
                  <h3 className="text-xl font-bold text-white">{calc.name}</h3>
                  <p className="mt-1 text-sm text-white/80">{calc.tagline}</p>
                </div>
                <ul className="space-y-3 px-6 py-6">
                  {calc.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
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

      <section id="features" className="border-t border-slate-200 py-20 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionIntro
            eyebrow="Features"
            title="Built for real refund workflows"
            description="Everything you need to move from spreadsheet tabs to a reliable, shareable calculation process."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className={marketingCardClass}>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 dark:from-blue-950/60 dark:to-blue-900/40 dark:text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionIntro
            eyebrow="Workflow"
            title="How it works"
            description="From sign-in to export in three straightforward steps."
          />
          <ol className="relative mt-12 grid gap-8 md:grid-cols-3">
            <div
              className="absolute left-[16.67%] right-[16.67%] top-5 hidden h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 dark:from-blue-900 dark:via-blue-700 dark:to-blue-900 md:block"
              aria-hidden
            />
            {steps.map((item) => (
              <li key={item.step} className="relative">
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md dark:bg-blue-500">
                  {item.step}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-slate-200 py-20 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-12 text-center shadow-lg sm:px-12 dark:from-blue-700 dark:to-blue-900">
            <div className="absolute inset-0 bg-grid-subtle opacity-30" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to run your next refund?</h2>
              <p className="mx-auto mt-3 max-w-xl text-blue-100">
                Sign in to access VSC and Gap calculators, save cases, and export results in seconds.
              </p>
              <Link
                href={primaryHref}
                className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <div className={logoMarkClass}>RC</div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Refund Calculators</span>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              VSC and Gap refund tools
            </p>
          </div>
          <div className="flex gap-8 text-sm text-slate-500 dark:text-slate-400">
            <div className="space-y-2">
              <p className="font-medium text-slate-700 dark:text-slate-300">Product</p>
              <Link href={primaryHref} className="block hover:text-slate-900 dark:hover:text-slate-100">
                {isAuthenticated ? 'App' : 'Sign in'}
              </Link>
              <a href="#calculators" className="block hover:text-slate-900 dark:hover:text-slate-100">
                Calculators
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-slate-700 dark:text-slate-300">Learn more</p>
              <a href="#features" className="block hover:text-slate-900 dark:hover:text-slate-100">
                Features
              </a>
              <Link href="/docs" className="block hover:text-slate-900 dark:hover:text-slate-100">
                API documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}