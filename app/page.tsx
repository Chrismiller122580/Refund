import { LandingPage } from '@/components/LandingPage'
import { getSession } from '@/lib/api-auth'

export default async function HomePage() {
  const session = await getSession()

  return <LandingPage isAuthenticated={session !== null} />
}