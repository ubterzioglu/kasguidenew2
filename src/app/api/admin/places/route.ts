import { NextResponse } from 'next/server'

import { isAdminApiConfigured, isAdminSessionValid } from '@/lib/admin-auth'
import { jsonFail, jsonOk, readLimit } from '@/lib/api-helpers'
import { ExistingPlaceSaveBodySchema } from '@/lib/api-schemas'
import {
  applyAdminPlaceAction,
  getAdminPlacesSnapshot,
  isPlaceAdminStoreConfigured,
} from '@/lib/place-admin-store'

export const dynamic = 'force-dynamic'

async function getAdminAccessError(request: Request): Promise<NextResponse | null> {
  if (!isAdminApiConfigured()) {
    return jsonFail('ADMIN_PASSWORD tanımlı değil.', 503)
  }

  if (!isPlaceAdminStoreConfigured()) {
    return jsonFail('Supabase review deposu hazır değil.', 503)
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
    const limit = readLimit(new URL(request.url).searchParams.get('limit'), 2000)
    const snapshot = await getAdminPlacesSnapshot(limit)

    return jsonOk(snapshot, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mevcut mekanlar okunamadı.'
    return jsonFail(message, 500)
  }
}

export async function POST(request: Request) {
  const authError = await getAdminAccessError(request)

  if (authError) {
    return authError
  }

  const rawBody = await request.json().catch(() => null)
  const parsed = ExistingPlaceSaveBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return jsonFail(`Geçersiz istek: ${parsed.error.issues[0]?.message ?? 'bilinmeyen hata'}`)
  }

  const { placeId, draft } = parsed.data

  try {
    const snapshot = await applyAdminPlaceAction({ placeId, draft })
    return jsonOk(snapshot)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mekan kaydı güncellenemedi.'
    return jsonFail(message)
  }
}
