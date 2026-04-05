import { NextResponse } from 'next/server'

import { jsonFail } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/admin/places', request.url), 307)
}

export async function POST() {
  return jsonFail('Review paneli kaldırıldı. Tüm mekan yönetimi /admin/places üzerinden yapılır.', 410)
}
