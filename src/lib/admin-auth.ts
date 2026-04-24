import 'server-only'

import { timingSafeEqual } from 'node:crypto'

import { isSessionAuthenticated } from '@/lib/admin-session'

const ADMIN_PASSWORD_HEADER = 'X-Admin-Password'
const LEGACY_ADMIN_HEADER = 'X-API-Key'

export function isAdminApiConfigured() {
  return Boolean(getExpectedAdminSecret())
}

export function isAdminRequestAuthorized(request: Request) {
  const expectedSecret = getExpectedAdminSecret()
  const providedSecret = request.headers.get(ADMIN_PASSWORD_HEADER) ?? request.headers.get(LEGACY_ADMIN_HEADER)

  if (!expectedSecret || !providedSecret) {
    return false
  }

  const FIXED_LENGTH = 64
  const expectedBuffer = Buffer.alloc(FIXED_LENGTH)
  const providedBuffer = Buffer.alloc(FIXED_LENGTH)
  Buffer.from(expectedSecret).copy(expectedBuffer)
  Buffer.from(providedSecret).copy(providedBuffer)

  return timingSafeEqual(expectedBuffer, providedBuffer)
}

export async function isAdminSessionValid(request: Request): Promise<boolean> {
  return isSessionAuthenticated(request)
}

function getExpectedAdminSecret() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_API_KEY || null
}