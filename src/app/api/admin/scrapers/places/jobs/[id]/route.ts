import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { jsonFail, jsonOk } from '@/lib/api-helpers'
import {
  getPlaceScraperJob,
  isPlaceScraperStoreConfigured,
  listCandidatesForJob,
} from '@/lib/place-scraper/job-store'

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

export async function GET(request: Request, { params }: RouteProps) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  try {
    const { id } = await params
    const [job, candidates] = await Promise.all([getPlaceScraperJob(id), listCandidatesForJob(id)])

    if (!job) {
      return jsonFail('Is bulunamadi.', 404)
    }

    return jsonOk({ job, candidates }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Is detayi okunamadi.'
    return jsonFail(message, 500)
  }
}
