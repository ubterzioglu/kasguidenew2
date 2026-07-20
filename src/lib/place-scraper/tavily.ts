import 'server-only'

import type { TavilyExtractResult, TavilySearchResult } from '@/lib/place-scraper/types'

const TAVILY_SEARCH_URL = 'https://api.tavily.com/search'
const TAVILY_EXTRACT_URL = 'https://api.tavily.com/extract'
const REQUEST_TIMEOUT_MS = 20000

function requireApiKey(): string {
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    throw new Error('TAVILY_API_KEY tanimli degil.')
  }

  return apiKey
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })

  if (response.status >= 500) {
    return fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  }

  return response
}

export async function tavilySearch(query: string, opts: { maxResults?: number } = {}): Promise<TavilySearchResult> {
  const apiKey = requireApiKey()

  const response = await fetchWithRetry(TAVILY_SEARCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: opts.maxResults ?? 5,
      search_depth: 'basic',
    }),
  })

  if (!response.ok) {
    throw new Error(`Tavily arama basarisiz (HTTP ${response.status}).`)
  }

  const data = (await response.json()) as { results?: Array<{ url: string; title: string; content: string }> }

  return {
    results: (data.results ?? []).map((item) => ({
      url: item.url,
      title: item.title,
      content: item.content,
    })),
  }
}

export async function tavilyExtract(urls: string[]): Promise<TavilyExtractResult> {
  if (urls.length === 0) {
    return { results: [], failedResults: [] }
  }

  const apiKey = requireApiKey()

  const response = await fetchWithRetry(TAVILY_EXTRACT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, urls }),
  })

  if (!response.ok) {
    throw new Error(`Tavily extract basarisiz (HTTP ${response.status}).`)
  }

  const data = (await response.json()) as {
    results?: Array<{ url: string; raw_content: string }>
    failed_results?: string[]
  }

  return {
    results: (data.results ?? []).map((item) => ({ url: item.url, rawContent: item.raw_content })),
    failedResults: data.failed_results ?? [],
  }
}
