import { AuthProvider } from '@/components/AuthProvider'
import { IntegrationSetup } from '@/components/IntegrationSetup'

export default function IntegrationPage() {
  return (
    <AuthProvider>
      <IntegrationSetup />
    </AuthProvider>
  )
}