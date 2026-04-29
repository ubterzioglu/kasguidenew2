import { NextResponse } from 'next/server'

import { isAdminApiConfigured, isAdminRequestAuthorized, isAdminSessionValid } from '@/lib/admin-auth'
import { clearSessionCookie, createSessionToken, setSessionCookie } from '@/lib/admin-session'
import { checkRateLimit, getRateLimitKeyFromRequest } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const SESSION_RATE_LIMIT_MAX = 10
const SESSION_RATE_LIMIT_WINDOW = 15 * 60 * 1000

export async function POST(request: Request) {
  if (!isAdminApiConfigured()) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD tanimli degil.' }, { status: 503 })
  }

  const rateLimitKey = getRateLimitKeyFromRequest(request)
  const rateLimitResult = checkRateLimit(rateLimitKey, SESSION_RATE_LIMIT_MAX, SESSION_RATE_LIMIT_WINDOW)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Cok fazla giris denemesi. Lutfen daha sonra tekrar deneyin.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)) } },
    )
  }

  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'Yetkisiz istek.' }, { status: 401 })
  }

  const token = await createSessionToken()
  const response = NextResponse.json({ ok: true })
  setSessionCookie(response, token)

  return response
}

export async function GET(request: Request) {
  if (!isAdminApiConfigured()) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD tanimli degil.' }, { status: 503 })
  }

  if (!(await isAdminSessionValid(request))) {
    return NextResponse.json({ error: 'Yetkisiz istek.' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  clearSessionCookie(response)
  return response
}
