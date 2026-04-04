import { NextResponse } from 'next/server'

import { getReviewAdminAccessError, jsonFail, jsonOk, readLimit } from '@/lib/api-helpers'
import { ReviewActionBodySchema } from '@/lib/api-schemas'
import { applyReviewAction, getReviewDashboardSnapshot } from '@/lib/place-review-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authError = getReviewAdminAccessError(request)

  if (authError) {
    return authError
  }

  const limit = readLimit(new URL(request.url).searchParams.get('limit'), 1000)
  const snapshot = await getReviewDashboardSnapshot(limit)

  return jsonOk(snapshot, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const authError = getReviewAdminAccessError(request)

  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = ReviewActionBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return jsonFail(`Gecersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  const { reviewId, action, notes, candidatePlaceId } = parsed.data

  try {
    const snapshot = await applyReviewAction({
      reviewId,
      action,
      notes: notes ?? null,
      candidatePlaceId: candidatePlaceId ?? null,
    })
    return jsonOk(snapshot)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Review aksiyonu tamamlanamadi.'
    return jsonFail(message)
  }
}
