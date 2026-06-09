import { NextResponse } from 'next/server'
import { AUTH_COOKIE, signToken, verifyPassword } from '@/lib/auth'
import { ensureAdminUser, ensureSchema, findUserByEmail } from '@/lib/db'

export async function POST(request: Request) {
  try {
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Server misconfigured: JWT_SECRET is not set in environment variables.' },
        { status: 500 },
      )
    }

    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    await ensureSchema()
    await ensureAdminUser()

    const user = await findUserByEmail(normalizedEmail)
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await signToken({ userId: user.id, email: user.email })
    const response = NextResponse.json({ user: { id: user.id, email: user.email } })
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (error) {
    console.error('Login error:', error)
    const message = error instanceof Error ? error.message : 'Login failed'
    if (message.includes('Database not configured')) {
      return NextResponse.json(
        { error: 'Database not configured. Link Neon to this Vercel project.' },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
