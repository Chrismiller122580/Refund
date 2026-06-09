import { AuthProvider } from '@/components/AuthProvider'
import { CalculatorApp } from '@/components/CalculatorApp'

export default function AppPage() {
  return (
    <AuthProvider>
      <CalculatorApp />
    </AuthProvider>
  )
}