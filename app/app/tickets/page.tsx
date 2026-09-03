import { AuthProvider } from '@/components/AuthProvider'
import { TicketBoard } from '@/components/TicketBoard'

export default function TicketsPage() {
  return (
    <AuthProvider>
      <TicketBoard />
    </AuthProvider>
  )
}
