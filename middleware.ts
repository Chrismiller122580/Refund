import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

async function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return false
  const secret = process.env.JWT_SECRET
  if (!secret) return false
  try {
    await jwtVerify(token, new TextEncoder().encode(secret))
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authed = await isAuthenticated(request)

  if (pathname === '/login') {
    if (authed) return NextResponse.redirect(new URL('/app', request.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/auth/login')) {
    return NextResponse.next()
  }

  if (!authed) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/login', '/api/:path*'],
}
