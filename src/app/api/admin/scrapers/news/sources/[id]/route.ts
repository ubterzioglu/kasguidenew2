import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { jsonFail, jsonOk } from '@/lib/api-helpers'
import { NewsScraperSourceUpdateBodySchema } from '@/lib/api-schemas'
import {
  deleteNewsScraperSource,
  isNewsScraperStoreConfigured,
  updateNewsScraperSource,
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

type RouteProps = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = NewsScraperSourceUpdateBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return jsonFail(`Gecersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  try {
    const { id } = await params
    const source = await updateNewsScraperSource(id, parsed.data)
    return jsonOk(source)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Haber kaynagi guncellenemedi.'
    return jsonFail(message, 500)
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  try {
    const { id } = await params
    await deleteNewsScraperSource(id)
    return jsonOk({ id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Haber kaynagi silinemedi.'
    return jsonFail(message, 500)
  }
}
