import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const API_KEY_PREFIX = 'rfnd_'

async function hasValidCookie(request: NextRequest) {
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

function hasApiKeyHeader(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    const token = authorization.slice(7).trim()
    if (token.startsWith(API_KEY_PREFIX)) return true
  }
  const headerKey = request.headers.get('x-api-key')?.trim()
  return Boolean(headerKey?.startsWith(API_KEY_PREFIX))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookieAuthed = await hasValidCookie(request)
  const apiKeyPresent = hasApiKeyHeader(request)
  const authed = cookieAuthed || apiKeyPresent

  if (pathname === '/login') {
    if (cookieAuthed) return NextResponse.redirect(new URL('/app', request.url))
    return NextResponse.next()
  }

  if (pathname === '/docs' || pathname.startsWith('/api/auth/login')) {
    return NextResponse.next()
  }

  if (!authed) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (pathname === '/') {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/app/:path*', '/login', '/docs', '/api/:path*'],
}