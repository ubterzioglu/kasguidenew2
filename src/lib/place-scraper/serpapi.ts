import 'server-only'

import type { TavilySearchResult } from '@/lib/place-scraper/types'

const SERPAPI_URL = 'https://serpapi.com/search.json'
const REQUEST_TIMEOUT_MS = 20000

export function isSerpApiConfigured(): boolean {
  return Boolean(process.env.SERPAPI_API_KEY)
}

export async function serpApiSearch(
  query: string,
  opts: { countryCode?: string; maxResults?: number } = {},
): Promise<TavilySearchResult> {
  const apiKey = process.env.SERPAPI_API_KEY

  if (!apiKey) {
    throw new Error('SERPAPI_API_KEY tanimli degil.')
  }

  const params = new URLSearchParams({
    engine: 'google',
    q: query,
    api_key: apiKey,
    gl: (opts.countryCode ?? 'tr').toLowerCase(),
    hl: 'tr',
    google_domain: 'google.com',
  })

  const response = await fetch(`${SERPAPI_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`SerpAPI arama basarisiz (HTTP ${response.status}).`)
  }

  const data = (await response.json()) as {
    organic_results?: Array<{ link: string; title: string; snippet?: string }>
  }

  const maxResults = opts.maxResults ?? 5

  return {
    results: (data.organic_results ?? []).slice(0, maxResults).map((item) => ({
      url: item.link,
      title: item.title,
      content: item.snippet ?? '',
    })),
  }
}
