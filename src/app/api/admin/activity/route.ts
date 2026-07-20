import { NextResponse } from 'next/server'

import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { getRecentActivity, isActivityStoreConfigured } from '@/lib/activity-store'
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

export async function GET(request: Request) {
  const authError = await getAdminAccessError(request)

  if (authError) {
    return authError
  }

  try {
    const entries = await getRecentActivity()
    return jsonOk(entries, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Aktiviteler okunamadı.'
    return jsonFail(message, 500)
  }
}
