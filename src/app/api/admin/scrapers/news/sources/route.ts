import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { jsonFail, jsonOk } from '@/lib/api-helpers'
import { NewsScraperSourceInputSchema } from '@/lib/api-schemas'
import {
  createNewsScraperSource,
  isNewsScraperStoreConfigured,
  listNewsScraperSources,
} from '@/lib/news-scraper/source-store'

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

export async function GET(request: Request) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  try {
    const sources = await listNewsScraperSources()
    return jsonOk(sources, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Haber kaynaklari okunamadi.'
    return jsonFail(message, 500)
  }
}

export async function POST(request: Request) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = NewsScraperSourceInputSchema.safeParse(rawBody)

  if (!parsed.success) {
    return jsonFail(`Gecersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  try {
    const source = await createNewsScraperSource(parsed.data)
    return jsonOk(source)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Haber kaynagi olusturulamadi.'
    return jsonFail(message, 500)
  }
}
