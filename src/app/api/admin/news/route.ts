import { isAdminApiConfigured, isAdminRequestAuthorized } from '@/lib/admin-auth'
import {
  AdminNewsCreateBodySchema,
} from '@/lib/api-schemas'
import { jsonFail, jsonOk } from '@/lib/api-helpers'
import { createNews, isUpdatesStoreConfigured, listAdminUpdatesSnapshot } from '@/lib/updates-store'

export const dynamic = 'force-dynamic'

function getAdminAccessError(request: Request) {
  if (!isAdminApiConfigured()) {
    return jsonFail('ADMIN_PASSWORD tanimli degil.', 503)
  }

  if (!isUpdatesStoreConfigured()) {
    return jsonFail('Guncellemeler veri deposu hazir degil.', 503)
  }

  if (!isAdminRequestAuthorized(request)) {
    return jsonFail('Yetkisiz istek.', 401)
  }

  return null
}

export async function GET(request: Request) {
  const authError = getAdminAccessError(request)
  if (authError) {
    return authError
  }

  try {
    const snapshot = await listAdminUpdatesSnapshot()
    return jsonOk(snapshot.news, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Admin haberleri okunamadi.'
    return jsonFail(message, 500)
  }
}

export async function POST(request: Request) {
  const authError = getAdminAccessError(request)
  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = AdminNewsCreateBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return jsonFail(`Gecersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  try {
    await createNews(parsed.data.news)
    const snapshot = await listAdminUpdatesSnapshot()
    return jsonOk(snapshot.news)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Haber kaydi olusturulamadi.'
    return jsonFail(message, 500)
  }
}