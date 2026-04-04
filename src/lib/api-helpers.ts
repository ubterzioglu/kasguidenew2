import { NextResponse } from 'next/server'

import { isAdminApiConfigured, isAdminRequestAuthorized } from '@/lib/admin-auth'
import { isPlaceReviewStoreConfigured } from '@/lib/place-review-store'

/**
 * Auth + config guard shared by review and raw-places admin routes.
 * Returns a NextResponse error if access is denied, otherwise null.
 */
export function getReviewAdminAccessError(request: Request): NextResponse | null {
  if (!isAdminApiConfigured()) {
    return jsonFail('ADMIN_PASSWORD tanimli degil.', 503)
  }

  if (!isPlaceReviewStoreConfigured()) {
    return jsonFail('Supabase review deposu hazir degil.', 503)
  }

  if (!isAdminRequestAuthorized(request)) {
    return jsonFail('Yetkisiz istek.', 401)
  }

  return null
}

/**
 * Standard success envelope: { success: true, data: T }
 */
export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ success: true, data }, init)
}

/**
 * Standard error envelope: { success: false, error: string }
 */
export function jsonFail(error: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error }, { status })
}

/**
 * Parses and clamps a ?limit= query param.
 * @param value  Raw string from searchParams
 * @param max    Upper bound (default 100)
 */
export function readLimit(value: string | null, max = 100): number {
  const parsed = Number.parseInt(value ?? '24', 10)

  if (!Number.isFinite(parsed)) {
    return 24
  }

  return Math.max(1, Math.min(parsed, max))
}

