import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { AdminAnnouncementCreateBodySchema } from '@/lib/api-schemas'
import { jsonFail, jsonOk } from '@/lib/api-helpers'
import {
  createAnnouncement,
  isUpdatesStoreConfigured,
  listAdminUpdatesSnapshot,
} from '@/lib/updates-store'

export const dynamic = 'force-dynamic'

async function getAdminAccessError(request: Request) {
  if (!isAdminApiConfigured()) {
    return jsonFail('ADMIN_PASSWORD tanimli degil.', 503)
  }

  if (!isUpdatesStoreConfigured()) {
    return jsonFail('Guncellemeler veri deposu hazir degil.', 503)
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
    const snapshot = await listAdminUpdatesSnapshot()
    return jsonOk(snapshot.announcements, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Admin duyurulari okunamadi.'
    return jsonFail(message, 500)
  }
}

export async function POST(request: Request) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = AdminAnnouncementCreateBodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return jsonFail(`Gecersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  try {
    await createAnnouncement(parsed.data.announcement)
    const snapshot = await listAdminUpdatesSnapshot()
    return jsonOk(snapshot.announcements)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Duyuru kaydi olusturulamadi.'
    return jsonFail(message, 500)
  }
}
