import type { NewsItem } from '@/types/updates'
import type { ParsedFeedItem } from '@/lib/news-scraper/types'

function normalizeTitle(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ')
}

export function isDuplicateNews(item: ParsedFeedItem, existingNews: NewsItem[]): boolean {
  const normalizedIncomingTitle = normalizeTitle(item.title)

  return existingNews.some((existing) => {
    if (item.link && existing.sourceUrl && existing.sourceUrl === item.link) {
      return true
    }

    return normalizeTitle(existing.title) === normalizedIncomingTitle
  })
}
