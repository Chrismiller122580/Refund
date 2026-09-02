import { redirect } from 'next/navigation'
import { AdminPortal } from '@/components/admin/AdminPortal'
import { AuthProvider } from '@/components/AuthProvider'
import { getAuthContext } from '@/lib/api-auth'
import { canManageIntegrations } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const ctx = await getAuthContext(new Request('http://localhost'))
  if (!ctx || !canManageIntegrations(ctx.role)) {
    redirect('/app')
  }

  return (
    <AuthProvider>
      <AdminPortal />
    </AuthProvider>
  )
}
