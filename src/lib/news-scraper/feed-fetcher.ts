import 'server-only'

const FEED_FETCH_TIMEOUT_MS = 15000
const USER_AGENT = 'KasGuideNewsScraper/1.0 (+https://www.kasguide.de)'

export async function fetchFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(FEED_FETCH_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Feed alinamadi (HTTP ${response.status}).`)
  }

  return response.text()
}
