import { PublicApiDocs } from '@/components/PublicApiDocs'
import { headers } from 'next/headers'

export default async function DocsPage() {
  const headerList = await headers()
  const host = headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') ?? 'https'
  const baseUrl = host ? `${protocol}://${host}` : undefined

  return <PublicApiDocs baseUrl={baseUrl} />
}