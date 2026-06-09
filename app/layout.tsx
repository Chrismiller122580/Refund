import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Refund Calculators — Freedom & GAP Warranty Tools',
  description:
    'Calculate Freedom and GAP warranty refunds with Excel-accurate formulas, saved cases, validation, and exports.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
