import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  const result = await requireAuth(request)
  if ('error' in result) return result.error

  const { ctx } = result
  return NextResponse.json({
    user: { id: ctx.userId, email: ctx.email, role: ctx.role },
  })
}