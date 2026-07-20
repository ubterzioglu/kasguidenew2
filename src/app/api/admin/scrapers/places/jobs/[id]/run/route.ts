import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { jsonFail, jsonOk } from '@/lib/api-helpers'
import { getPlaceScraperJob, isPlaceScraperStoreConfigured } from '@/lib/place-scraper/job-store'
import { runPlaceScraperJob } from '@/lib/place-scraper/run-job'

export const dynamic = 'force-dynamic'

async function getAdminAccessError(request: Request) {
  if (!isAdminApiConfigured()) {
    return jsonFail('ADMIN_PASSWORD tanimli degil.', 503)
  }

  if (!isPlaceScraperStoreConfigured()) {
    return jsonFail('Hizmet arama scraper veri deposu hazir degil.', 503)
  }

  if (!process.env.TAVILY_API_KEY) {
    return jsonFail('TAVILY_API_KEY tanimli degil.', 503)
  }

  if (!process.env.GEMINI_API_KEY) {
    return jsonFail('GEMINI_API_KEY tanimli degil.', 503)
  }

  if (!(await isAdminSessionValid(request))) {
    return jsonFail('Yetkisiz istek.', 401)
  }

  return null
}

type RouteProps = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteProps) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  try {
    const { id } = await params
    const job = await getPlaceScraperJob(id)

    if (!job) {
      return jsonFail('Is bulunamadi.', 404)
    }

    const result = await runPlaceScraperJob(id)
    return jsonOk(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Is calistirilamadi.'
    return jsonFail(message, 500)
  }
}
