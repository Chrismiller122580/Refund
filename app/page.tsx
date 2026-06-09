import { AuthProvider } from '@/components/AuthProvider'
import { CalculatorApp } from '@/components/CalculatorApp'

export default function HomePage() {
  return (
    <AuthProvider>
      <CalculatorApp />
    </AuthProvider>
  )
}
