import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const AUTH_COOKIE = 'bl_auth'
const SECRET = process.env.AUTH_SECRET || 'fallback-secret-change-me'

export function createAuthToken(): string {
  const payload = `${Date.now()}:${SECRET}`
  return Buffer.from(payload).toString('base64')
}

export function validateAuthToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [, secret] = decoded.split(':')
    return secret === SECRET
  } catch {
    return false
  }
}

export function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  if (!token) return false
  return validateAuthToken(token)
}

export function getAuthCookieOptions() {
  return {
    name: AUTH_COOKIE,
    value: createAuthToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  }
}

export function checkPassword(password: string): boolean {
  const appPassword = process.env.APP_PASSWORD
  if (!appPassword) return false
  return password === appPassword
}
