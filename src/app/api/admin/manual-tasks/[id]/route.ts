import { NextResponse } from 'next/server'

import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { deleteManualTask, isActivityStoreConfigured, setManualTaskDone } from '@/lib/activity-store'
import { jsonFail, jsonOk } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

async function getAdminAccessError(request: Request): Promise<NextResponse | null> {
  if (!isAdminApiConfigured()) {
    return jsonFail('ADMIN_PASSWORD tanımlı değil.', 503)
  }

  if (!isActivityStoreConfigured()) {
    return jsonFail('Supabase veri deposu hazır değil.', 503)
  }

  if (!(await isAdminSessionValid(request))) {
    return jsonFail('Yetkisiz istek.', 401)
  }

  return null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await getAdminAccessError(request)

  if (authError) {
    return authError
  }

  const { id } = await params
  const rawBody = await request.json().catch(() => null)
  const body = rawBody as { isDone?: boolean } | null

  if (typeof body?.isDone !== 'boolean') {
    return jsonFail('Geçersiz istek gövdesi.')
  }

  try {
    const tasks = await setManualTaskDone(id, body.isDone)
    return jsonOk(tasks)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Görev güncellenemedi.'
    return jsonFail(message)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await getAdminAccessError(request)

  if (authError) {
    return authError
  }

  const { id } = await params

  try {
    const tasks = await deleteManualTask(id)
    return jsonOk(tasks)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Görev silinemedi.'
    return jsonFail(message)
  }
}
