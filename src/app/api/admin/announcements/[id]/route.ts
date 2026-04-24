import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { AdminAnnouncementUpdateBodySchema } from '@/lib/api-schemas'
import { jsonFail, jsonOk } from '@/lib/api-helpers'
import {
  archiveAnnouncement,
  isUpdatesStoreConfigured,
  listAdminUpdatesSnapshot,
  updateAnnouncement,
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

type RouteProps = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteProps) {
  const authError = await getAdminAccessError(request)
  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = AdminAnnouncementUpdateBodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return jsonFail(`Gecersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  try {
    const { id } = await params
    await updateAnnouncement(id, parsed.data.announcement)
    const snapshot = await listAdminUpdatesSnapshot()
    return jsonOk(snapshot.announcements)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Duyuru kaydi guncellenemedi.'
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
    await archiveAnnouncement(id)
    const snapshot = await listAdminUpdatesSnapshot()
    return jsonOk(snapshot.announcements)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Duyuru arsivlenemedi.'
    return jsonFail(message, 500)
  }
}
