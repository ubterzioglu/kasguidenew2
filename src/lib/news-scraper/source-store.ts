import 'server-only'

import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import type {
  NewsScraperRunStatus,
  NewsScraperSource,
  NewsScraperSourceInput,
  NewsScraperSourceType,
} from '@/lib/news-scraper/types'

const NEWS_SCRAPER_SOURCES_TABLE = 'news_scraper_sources'

type NewsScraperSourceRow = {
  id: string
  name: string
  feed_url: string
  source_type: NewsScraperSourceType
  is_enabled: boolean
  last_run_at: string | null
  last_run_status: NewsScraperRunStatus | null
  last_run_found_count: number | null
  last_run_inserted_count: number | null
  last_run_error: string | null
  created_at: string
  updated_at: string
}

function requireClient() {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Haber kaynagi veri deposu hazir degil.')
  }

  return client
}

function mapSource(row: NewsScraperSourceRow): NewsScraperSource {
  return {
    id: row.id,
    name: row.name,
    feedUrl: row.feed_url,
    sourceType: row.source_type,
    isEnabled: row.is_enabled,
    lastRunAt: row.last_run_at,
    lastRunStatus: row.last_run_status,
    lastRunFoundCount: row.last_run_found_count,
    lastRunInsertedCount: row.last_run_inserted_count,
    lastRunError: row.last_run_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const SOURCE_COLUMNS =
  'id, name, feed_url, source_type, is_enabled, last_run_at, last_run_status, last_run_found_count, last_run_inserted_count, last_run_error, created_at, updated_at'

export function isNewsScraperStoreConfigured() {
  return Boolean(getSupabaseAdminClient())
}

export async function listNewsScraperSources(): Promise<NewsScraperSource[]> {
  const client = requireClient()
  const { data, error } = await client
    .from(NEWS_SCRAPER_SOURCES_TABLE)
    .select(SOURCE_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Haber kaynaklari okunamadi.')
  }

  return ((data ?? []) as NewsScraperSourceRow[]).map(mapSource)
}

export async function listEnabledNewsScraperSources(): Promise<NewsScraperSource[]> {
  const client = requireClient()
  const { data, error } = await client
    .from(NEWS_SCRAPER_SOURCES_TABLE)
    .select(SOURCE_COLUMNS)
    .eq('is_enabled', true)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error('Aktif haber kaynaklari okunamadi.')
  }

  return ((data ?? []) as NewsScraperSourceRow[]).map(mapSource)
}

export async function createNewsScraperSource(input: NewsScraperSourceInput): Promise<NewsScraperSource> {
  const client = requireClient()
  const { data, error } = await client
    .from(NEWS_SCRAPER_SOURCES_TABLE)
    .insert({
      name: input.name.trim(),
      feed_url: input.feedUrl.trim(),
      source_type: input.sourceType,
      is_enabled: input.isEnabled,
    })
    .select(SOURCE_COLUMNS)
    .single()

  if (error) {
    throw new Error('Haber kaynagi olusturulamadi.')
  }

  return mapSource(data as NewsScraperSourceRow)
}

export async function updateNewsScraperSource(
  id: string,
  input: Partial<NewsScraperSourceInput>,
): Promise<NewsScraperSource> {
  const client = requireClient()
  const payload: Record<string, unknown> = {}

  if (input.name !== undefined) payload.name = input.name.trim()
  if (input.feedUrl !== undefined) payload.feed_url = input.feedUrl.trim()
  if (input.sourceType !== undefined) payload.source_type = input.sourceType
  if (input.isEnabled !== undefined) payload.is_enabled = input.isEnabled

  const { data, error } = await client
    .from(NEWS_SCRAPER_SOURCES_TABLE)
    .update(payload)
    .eq('id', id)
    .select(SOURCE_COLUMNS)
    .single()

  if (error) {
    throw new Error('Haber kaynagi guncellenemedi.')
  }

  return mapSource(data as NewsScraperSourceRow)
}

export async function deleteNewsScraperSource(id: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.from(NEWS_SCRAPER_SOURCES_TABLE).delete().eq('id', id)

  if (error) {
    throw new Error('Haber kaynagi silinemedi.')
  }
}

export async function recordNewsScraperSourceRun(
  id: string,
  result: { status: NewsScraperRunStatus; foundCount: number; insertedCount: number; error?: string | null },
): Promise<void> {
  const client = requireClient()
  const { error } = await client
    .from(NEWS_SCRAPER_SOURCES_TABLE)
    .update({
      last_run_at: new Date().toISOString(),
      last_run_status: result.status,
      last_run_found_count: result.foundCount,
      last_run_inserted_count: result.insertedCount,
      last_run_error: result.error ?? null,
    })
    .eq('id', id)

  if (error) {
    throw new Error('Haber kaynagi calisma durumu guncellenemedi.')
  }
}
