import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Refund Calculators',
  description: 'Freedom and GAP warranty refund calculations',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
