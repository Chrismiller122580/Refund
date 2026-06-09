import { NextResponse } from 'next/server'
import { AUTH_COOKIE, signToken, verifyPassword } from '@/lib/auth'
import { ensureSchema, findUserByEmail } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await ensureSchema()
    const user = await findUserByEmail(email.toLowerCase().trim())
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
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
