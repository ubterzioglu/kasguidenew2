import 'server-only'

import { XMLParser } from 'fast-xml-parser'

import type { NewsScraperSourceType, ParsedFeedItem } from '@/lib/news-scraper/types'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
})

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function textOf(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && '#text' in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)['#text'] ?? '')
  }
  return value == null ? '' : String(value)
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseRssItems(xml: Record<string, unknown>): ParsedFeedItem[] {
  const channel = (xml.rss as Record<string, unknown> | undefined)?.channel as Record<string, unknown> | undefined
  if (!channel) return []

  const items = asArray(channel.item as Record<string, unknown> | Record<string, unknown>[] | undefined)

  return items.map((item) => {
    const guid = item.guid !== undefined ? textOf(item.guid) : null
    return {
      title: stripHtml(textOf(item.title)),
      link: textOf(item.link),
      publishedAt: item.pubDate !== undefined ? normalizeDate(textOf(item.pubDate)) : null,
      summary: stripHtml(textOf(item.description ?? '')),
      guid: guid || null,
    }
  })
}

function parseAtomEntries(xml: Record<string, unknown>): ParsedFeedItem[] {
  const feed = xml.feed as Record<string, unknown> | undefined
  if (!feed) return []

  const entries = asArray(feed.entry as Record<string, unknown> | Record<string, unknown>[] | undefined)

  return entries.map((entry) => {
    const linkField = entry.link as Record<string, unknown> | Record<string, unknown>[] | undefined
    const links = asArray(linkField)
    const primaryLink =
      links.find((l) => (l as Record<string, unknown>)['@_rel'] === 'alternate') ?? links[0]
    const link = primaryLink ? String((primaryLink as Record<string, unknown>)['@_href'] ?? '') : ''
    const id = entry.id !== undefined ? textOf(entry.id) : null

    return {
      title: stripHtml(textOf(entry.title)),
      link,
      publishedAt: entry.published !== undefined
        ? normalizeDate(textOf(entry.published))
        : entry.updated !== undefined
          ? normalizeDate(textOf(entry.updated))
          : null,
      summary: stripHtml(textOf(entry.summary ?? entry.content ?? '')),
      guid: id || null,
    }
  })
}

function normalizeDate(value: string): string | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function parseFeedItems(xml: string, sourceType: NewsScraperSourceType): ParsedFeedItem[] {
  const parsed = parser.parse(xml) as Record<string, unknown>

  if (sourceType === 'atom') {
    return parseAtomEntries(parsed)
  }

  return parseRssItems(parsed)
}
