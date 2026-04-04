import { getReviewAdminAccessError, jsonFail, jsonOk, readLimit } from '@/lib/api-helpers'
import { SweepPlaceSaveBodySchema } from '@/lib/api-schemas'
import { applySweepPlaceAction, getSweepDashboardSnapshot } from '@/lib/place-sweep-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authError = getReviewAdminAccessError(request)

  if (authError) {
    return authError
  }

  try {
    const limit = readLimit(new URL(request.url).searchParams.get('limit'), 1000)
    const snapshot = await getSweepDashboardSnapshot(limit)
    return jsonOk(snapshot, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sweep paneli yuklenemedi.'
    return jsonFail(message, 500)
  }
}

export async function POST(request: Request) {
  const authError = getReviewAdminAccessError(request)

  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = SweepPlaceSaveBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return jsonFail(`Gecersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  const { placeId, action, draft } = parsed.data

  try {
    const snapshot = await applySweepPlaceAction({ placeId, action, draft })
    return jsonOk(snapshot)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sweep mekan kaydi guncellenemedi.'
    return jsonFail(message)
  }
}
