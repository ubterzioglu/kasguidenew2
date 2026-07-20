import 'server-only'

import { createNews, listAdminUpdatesSnapshot } from '@/lib/updates-store'
import { fetchFeed } from '@/lib/news-scraper/feed-fetcher'
import { parseFeedItems } from '@/lib/news-scraper/feed-parser'
import {
  scoreRelevance,
  RELEVANCE_ACCEPT_THRESHOLD,
  RELEVANCE_AUTO_PUBLISH_THRESHOLD,
} from '@/lib/news-scraper/relevance'
import { isDuplicateNews } from '@/lib/news-scraper/dedupe'
import {
  listEnabledNewsScraperSources,
  recordNewsScraperSourceRun,
} from '@/lib/news-scraper/source-store'
import type { NewsScraperRunResult } from '@/lib/news-scraper/types'
import type { ContentStatus } from '@/types/updates'

export async function runNewsScraper(): Promise<NewsScraperRunResult[]> {
  const sources = await listEnabledNewsScraperSources()

  if (sources.length === 0) {
    return []
  }

  const existingSnapshot = await listAdminUpdatesSnapshot()
  const existingNews = [...existingSnapshot.news]

  const results: NewsScraperRunResult[] = []

  for (const source of sources) {
    let found = 0
    let inserted = 0
    let skipped = 0
    let published = 0

    try {
      const xml = await fetchFeed(source.feedUrl)
      const items = parseFeedItems(xml, source.sourceType)
      found = items.length

      for (const item of items) {
        if (!item.title || !item.link) {
          skipped += 1
          continue
        }

        if (isDuplicateNews(item, existingNews)) {
          skipped += 1
          continue
        }

        const score = scoreRelevance(item)
        if (score < RELEVANCE_ACCEPT_THRESHOLD) {
          skipped += 1
          continue
        }

        // Yuksek skorlular dogrudan yayina; sinirdakiler admin onayi icin draft.
        const status: ContentStatus =
          score >= RELEVANCE_AUTO_PUBLISH_THRESHOLD ? 'published' : 'draft'

        await createNews({
          title: item.title,
          summary: item.summary || item.title,
          content: item.summary || item.title,
          imageUrl: null,
          publishedAt: item.publishedAt ?? new Date().toISOString(),
          isActive: true,
          sortOrder: 0,
          status,
          sourceUrl: item.link,
          sourceName: source.name,
        })

        if (status === 'published') {
          published += 1
        }
        inserted += 1
        existingNews.push({
          id: `pending-${item.link}`,
          title: item.title,
          slug: '',
          summary: item.summary,
          content: item.summary,
          imageUrl: null,
          publishedAt: item.publishedAt,
          isActive: true,
          sortOrder: 0,
          status,
          sourceUrl: item.link,
          sourceName: source.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }

      await recordNewsScraperSourceRun(source.id, {
        status: 'success',
        foundCount: found,
        insertedCount: inserted,
      })

      results.push({ sourceId: source.id, sourceName: source.name, found, inserted, skipped, published })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bilinmeyen hata.'

      await recordNewsScraperSourceRun(source.id, {
        status: 'error',
        foundCount: found,
        insertedCount: inserted,
        error: message,
      })

      results.push({ sourceId: source.id, sourceName: source.name, found, inserted, skipped, published, error: message })
    }
  }

  return results
}
