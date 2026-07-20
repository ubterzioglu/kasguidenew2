export type NewsScraperSourceType = 'rss' | 'atom' | 'gdelt_query'
export type NewsScraperRunStatus = 'success' | 'error' | 'partial'

export type NewsScraperSource = {
  id: string
  name: string
  feedUrl: string
  sourceType: NewsScraperSourceType
  isEnabled: boolean
  lastRunAt: string | null
  lastRunStatus: NewsScraperRunStatus | null
  lastRunFoundCount: number | null
  lastRunInsertedCount: number | null
  lastRunError: string | null
  createdAt: string
  updatedAt: string
}

export type NewsScraperSourceInput = {
  name: string
  feedUrl: string
  sourceType: NewsScraperSourceType
  isEnabled: boolean
}

export type ParsedFeedItem = {
  title: string
  link: string
  publishedAt: string | null
  summary: string
  guid: string | null
}

export type NewsScraperRunResult = {
  sourceId: string
  sourceName: string
  found: number
  inserted: number
  skipped: number
  error?: string
}
