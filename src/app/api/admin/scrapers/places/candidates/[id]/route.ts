import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { jsonFail, jsonOk } from '@/lib/api-helpers'
import { PlaceScraperCandidateActionBodySchema } from '@/lib/api-schemas'
import { isPlaceScraperStoreConfigured } from '@/lib/place-scraper/job-store'
import { promoteCandidateToPlace, rejectCandidate } from '@/lib/place-scraper/promote'

export const dynamic = 'force-dynamic'

async function getAdminAccessError(request: Request) {
  if (!isAdminApiConfigured()) {
    return jsonFail('ADMIN_PASSWORD tanimli degil.', 503)
  }

  if (!isPlaceScraperStoreConfigured()) {
    return jsonFail('Hizmet arama scraper veri deposu hazir degil.', 503)
  }

  if (!(await isAdminSessionValid(request))) {
    return jsonFail('Yetkisiz istek.', 401)
  }

  return null
}

type RouteProps = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = PlaceScraperCandidateActionBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return jsonFail(`Gecersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  try {
    const { id } = await params

    if (parsed.data.action === 'promote') {
      const result = await promoteCandidateToPlace(id)
      return jsonOk(result)
    }

    await rejectCandidate(id)
    return jsonOk({ id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Aday islemi basarisiz.'
    return jsonFail(message, 500)
  }
}
