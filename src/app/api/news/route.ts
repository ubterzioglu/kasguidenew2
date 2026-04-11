import { jsonFail, jsonOk, readLimit } from '@/lib/api-helpers'
import { listPublicNews } from '@/lib/updates-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limit = readLimit(url.searchParams.get('limit'), 60)
    const news = await listPublicNews(limit)

    return jsonOk(news, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Haberler okunamadi.'
    return jsonFail(message, 500)
  }
}