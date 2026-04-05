import { NextResponse } from 'next/server'

/**
 * Shared helpers for admin API routes.
 */
export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ success: true, data }, init)
}

export function jsonFail(error: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error }, { status })
}

export function readLimit(value: string | null, max = 100): number {
  const parsed = Number.parseInt(value ?? '24', 10)

  if (!Number.isFinite(parsed)) {
    return 24
  }

  return Math.max(1, Math.min(parsed, max))
}
