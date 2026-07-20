import { NextResponse } from 'next/server'

import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { createManualTask, isActivityStoreConfigured, listManualTasks } from '@/lib/activity-store'
import { jsonFail, jsonOk } from '@/lib/api-helpers'
import type { ManualTaskInput } from '@/types/activity'

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

export async function GET(request: Request) {
  const authError = await getAdminAccessError(request)

  if (authError) {
    return authError
  }

  try {
    const tasks = await listManualTasks()
    return jsonOk(tasks, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Yapılacaklar listesi okunamadı.'
    return jsonFail(message, 500)
  }
}

export async function POST(request: Request) {
  const authError = await getAdminAccessError(request)

  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const body = rawBody as { task?: ManualTaskInput } | null

  if (!body?.task?.label || typeof body.task.label !== 'string') {
    return jsonFail('Görev başlığı zorunlu.')
  }

  try {
    const tasks = await createManualTask(body.task)
    return jsonOk(tasks)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Görev oluşturulamadı.'
    return jsonFail(message)
  }
}
