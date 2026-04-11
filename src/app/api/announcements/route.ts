import { jsonFail, jsonOk, readLimit } from '@/lib/api-helpers'
import { listPublicAnnouncements } from '@/lib/updates-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limit = readLimit(url.searchParams.get('limit'), 60)
    const announcements = await listPublicAnnouncements(limit)

    return jsonOk(announcements, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Duyurular okunamadi.'
    return jsonFail(message, 500)
  }
}