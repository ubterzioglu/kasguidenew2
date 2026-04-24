import 'server-only'

import { jwtVerify, SignJWT } from 'jose'
import { NextResponse } from 'next/server'

const SESSION_COOKIE_NAME = 'kasguide-admin-session'
const SESSION_DURATION = 4 * 60 * 60 * 1000
const COOKIE_MAX_AGE = 14400

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_PASSWORD || process.env.ADMIN_API_KEY || 'fallback-secret'
  const encoded = new TextEncoder().encode(secret)

  if (encoded.length >= 32) {
    return encoded.slice(0, 32)
  }

  const padded = new Uint8Array(32)
  padded.set(encoded)
  return padded
}

export async function createSessionToken(): Promise<string> {
  const secret = getJwtSecret()
  const now = Date.now()

  return new SignJWT({ sub: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(Math.floor(now / 1000))
    .setExpirationTime(Math.floor((now + SESSION_DURATION) / 1000))
    .sign(secret)
}

export async function verifySessionToken(token: string): Promise<{ valid: boolean; expired: boolean }> {
  try {
    const secret = getJwtSecret()
    await jwtVerify(token, secret)
    return { valid: true, expired: false }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'JWTExpired') {
      return { valid: false, expired: true }
    }
    return { valid: false, expired: false }
  }
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
}

export function getSessionTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  for (const pair of cookieHeader.split(';')) {
    const [name, ...rest] = pair.split('=')
    if (name?.trim() === SESSION_COOKIE_NAME) {
      return rest.join('=').trim() || null
    }
  }

  return null
}

export async function isSessionAuthenticated(request: Request): Promise<boolean> {
  const token = getSessionTokenFromCookie(request)
  if (!token) return false

  const { valid } = await verifySessionToken(token)
  return valid
}
