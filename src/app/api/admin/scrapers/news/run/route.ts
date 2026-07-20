import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { jsonFail, jsonOk } from '@/lib/api-helpers'
import { isNewsScraperStoreConfigured } from '@/lib/news-scraper/source-store'
import { runNewsScraper } from '@/lib/news-scraper/run'

export const dynamic = 'force-dynamic'

async function getAdminAccessError(request: Request) {
  if (!isAdminApiConfigured()) {
    return jsonFail('ADMIN_PASSWORD tanimli degil.', 503)
  }

  if (!isNewsScraperStoreConfigured()) {
    return jsonFail('Haber kaynagi veri deposu hazir degil.', 503)
  }

  if (!(await isAdminSessionValid(request))) {
    return jsonFail('Yetkisiz istek.', 401)
  }

  return null
}

export async function POST(request: Request) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  try {
    const results = await runNewsScraper()
    const totalInserted = results.reduce((sum, result) => sum + result.inserted, 0)
    return jsonOk({ results, totalInserted })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Haber taramasi calistirilamadi.'
    return jsonFail(message, 500)
  }
}
