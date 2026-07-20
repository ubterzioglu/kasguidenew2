import type { ParsedFeedItem } from '@/lib/news-scraper/types'

const DEFAULT_KEYWORDS = ['kaş', 'kas', 'antalya', 'kalkan', 'kekova', 'kaputaş', 'likya']

const RECENCY_HALF_LIFE_DAYS = 7

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
}

function keywordScore(item: ParsedFeedItem, keywords: string[]): number {
  const haystack = normalize(`${item.title} ${item.summary}`)
  let matches = 0

  for (const keyword of keywords) {
    if (haystack.includes(normalize(keyword))) {
      matches += 1
    }
  }

  return Math.min(matches / Math.max(keywords.length, 1), 1)
}

function recencyScore(item: ParsedFeedItem): number {
  if (!item.publishedAt) {
    return 0.5
  }

  const ageDays = (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  if (ageDays < 0) {
    return 1
  }

  return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS)
}

export function scoreRelevance(item: ParsedFeedItem, keywords: string[] = DEFAULT_KEYWORDS): number {
  const kw = keywordScore(item, keywords)
  const recency = recencyScore(item)

  return kw * 0.7 + recency * 0.3
}

export const RELEVANCE_ACCEPT_THRESHOLD = 0.25
