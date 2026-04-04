import { getReviewAdminAccessError, jsonFail, jsonOk, readLimit } from '@/lib/api-helpers'
import { RawPlaceSaveBodySchema } from '@/lib/api-schemas'
import { applyRawPlaceAction, getReviewDashboardSnapshot } from '@/lib/place-review-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authError = getReviewAdminAccessError(request)

  if (authError) {
    return authError
  }

  const limit = readLimit(new URL(request.url).searchParams.get('limit'))
  const snapshot = await getReviewDashboardSnapshot(limit)

  return jsonOk(snapshot, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const authError = getReviewAdminAccessError(request)

  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = RawPlaceSaveBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return jsonFail(`Gecersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  const { rawPlaceId, action, draft } = parsed.data

  try {
    const snapshot = await applyRawPlaceAction({ rawPlaceId, action, draft })
    return jsonOk(snapshot)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mekan kaydi guncellenemedi.'
    return jsonFail(message)
  }
}
