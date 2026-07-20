import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { jsonFail, jsonOk } from '@/lib/api-helpers'
import { PlaceScraperJobCreateBodySchema } from '@/lib/api-schemas'
import {
  createPlaceScraperJob,
  isPlaceScraperStoreConfigured,
  listPlaceScraperJobs,
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

export async function GET(request: Request) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  try {
    const jobs = await listPlaceScraperJobs()
    return jsonOk(jobs, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Is listesi okunamadi.'
    return jsonFail(message, 500)
  }
}

export async function POST(request: Request) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = PlaceScraperJobCreateBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return jsonFail(`Gecersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  try {
    const job = await createPlaceScraperJob(parsed.data)
    return jsonOk(job)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Is olusturulamadi.'
    return jsonFail(message, 500)
  }
}
