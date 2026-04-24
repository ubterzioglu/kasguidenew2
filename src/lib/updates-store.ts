import 'server-only'

import { slugifyText } from '@/lib/place-review-utils'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import type {
  AnnouncementInput,
  AnnouncementItem,
  AnnouncementPriority,
  ContentStatus,
  NewsInput,
  NewsItem,
  UpdateCarouselItem,
  UpdatesAdminSnapshot,
} from '@/types/updates'

const NEWS_TABLE = 'news'
const ANNOUNCEMENTS_TABLE = 'announcements'

type NewsRow = {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  image_url: string | null
  published_at: string | null
  is_active: boolean
  sort_order: number | null
  status: ContentStatus
  created_at: string
  updated_at: string
}

type AnnouncementRow = {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  image_url: string | null
  priority: AnnouncementPriority
  is_pinned: boolean
  is_active: boolean
  start_date: string | null
  end_date: string | null
  published_at: string | null
  sort_order: number | null
  status: ContentStatus
  created_at: string
  updated_at: string
}

function requireClient() {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Guncellemeler veri deposu hazir degil.')
  }

  return client
}

function normalizeNullableText(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function normalizeRequiredText(value: string | null | undefined, fallbackMessage: string) {
  const normalized = value?.trim()

  if (!normalized) {
    throw new Error(fallbackMessage)
  }

  return normalized
}

function normalizeDate(value: string | null | undefined) {
  const normalized = normalizeNullableText(value)
  if (!normalized) {
    return null
  }

  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Gecersiz tarih degeri.')
  }

  return date.toISOString()
}

const MAX_SLUG_ITERATIONS = 100

async function ensureUniqueSlug(
  tableName: typeof NEWS_TABLE | typeof ANNOUNCEMENTS_TABLE,
  title: string,
  currentId?: string,
  preferredSlug?: string | null,
) {
  const client = requireClient()
  const baseSlug = slugifyText(preferredSlug || title) || `icerik-${Date.now()}`
  let slug = baseSlug
  let suffix = 1

  for (let iteration = 0; iteration < MAX_SLUG_ITERATIONS; iteration++) {
    const { data, error } = await client.from(tableName).select('id, slug').eq('slug', slug).maybeSingle()

    if (error) {
      throw new Error('Slug kontrolu yapilamadi.')
    }

    const existing = data as { id: string; slug: string } | null
    if (!existing || existing.id === currentId) {
      return slug
    }

    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }

  throw new Error('Slug kontrolü aşırı tekrara ulaştı.')
}

function mapNews(row: NewsRow): NewsItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    imageUrl: row.image_url,
    publishedAt: row.published_at,
    isActive: row.is_active,
    sortOrder: row.sort_order ?? 0,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapAnnouncement(row: AnnouncementRow): AnnouncementItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    imageUrl: row.image_url,
    priority: row.priority,
    isPinned: row.is_pinned,
    isActive: row.is_active,
    startDate: row.start_date,
    endDate: row.end_date,
    publishedAt: row.published_at,
    sortOrder: row.sort_order ?? 0,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return 'Yakinda'
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value))
}

function announcementWeight(priority: AnnouncementPriority, isPinned: boolean) {
  const priorityScore = priority === 'urgent' ? 30 : priority === 'normal' ? 20 : 10
  return priorityScore + (isPinned ? 100 : 0)
}

function isPublishedAtVisible(value: string | null) {
  if (!value) {
    return false
  }

  return new Date(value).getTime() <= Date.now()
}

function isNewsCurrentlyVisible(item: NewsItem) {
  return item.status === 'published' && item.isActive && isPublishedAtVisible(item.publishedAt)
}

function isAnnouncementCurrentlyVisible(item: AnnouncementItem) {
  const now = Date.now()
  const start = item.startDate ? new Date(item.startDate).getTime() : null
  const end = item.endDate ? new Date(item.endDate).getTime() : null

  if (!isPublishedAtVisible(item.publishedAt)) {
    return false
  }

  if (start && start > now) {
    return false
  }

  if (end && end < now) {
    return false
  }

  return item.status === 'published' && item.isActive
}

export function isUpdatesStoreConfigured() {
  return Boolean(getSupabaseAdminClient())
}

export async function listPublicNews(limit = 12): Promise<NewsItem[]> {
  const client = requireClient()
  const nowIso = new Date().toISOString()

  const { data, error } = await client
    .from(NEWS_TABLE)
    .select('id, title, slug, summary, content, image_url, published_at, is_active, sort_order, status, created_at, updated_at')
    .eq('status', 'published')
    .eq('is_active', true)
    .not('published_at', 'is', null)
    .lte('published_at', nowIso)
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error('Haberler okunamadi.')
  }

  return ((data ?? []) as NewsRow[]).map(mapNews)
}

export async function listPublicAnnouncements(limit = 12): Promise<AnnouncementItem[]> {
  const client = requireClient()
  const nowIso = new Date().toISOString()
  const queryLimit = Math.max(limit * 3, limit)

  const { data, error } = await client
    .from(ANNOUNCEMENTS_TABLE)
    .select('id, title, slug, summary, content, image_url, priority, is_pinned, is_active, start_date, end_date, published_at, sort_order, status, created_at, updated_at')
    .eq('status', 'published')
    .eq('is_active', true)
    .not('published_at', 'is', null)
    .lte('published_at', nowIso)
    .order('is_pinned', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(queryLimit)

  if (error) {
    throw new Error('Duyurular okunamadi.')
  }

  return ((data ?? []) as AnnouncementRow[])
    .map(mapAnnouncement)
    .filter(isAnnouncementCurrentlyVisible)
    .slice(0, limit)
}

export async function listUpdatesCarouselItems(limit = 9): Promise<UpdateCarouselItem[]> {
  const [news, announcements] = await Promise.all([
    listPublicNews(limit),
    listPublicAnnouncements(limit),
  ])

  const feed: Array<UpdateCarouselItem & { sortWeight: number; sortDate: number }> = [
    ...announcements
      .filter(isAnnouncementCurrentlyVisible)
      .map((item) => ({
        id: item.id,
        type: 'announcement' as const,
        title: item.title,
        summary: item.summary,
        dateLabel: formatDateLabel(item.startDate ?? item.publishedAt),
        href: `/duyurular/${item.slug}`,
        imageUrl: item.imageUrl,
        badgeLabel: 'Duyuru',
        priority: item.priority,
        isPinned: item.isPinned,
        sortWeight: announcementWeight(item.priority, item.isPinned),
        sortDate: new Date(item.publishedAt ?? item.createdAt).getTime(),
      })),
    ...news.map((item) => ({
      id: item.id,
      type: 'news' as const,
      title: item.title,
      summary: item.summary,
      dateLabel: formatDateLabel(item.publishedAt),
      href: `/haberler/${item.slug}`,
      imageUrl: item.imageUrl,
      badgeLabel: 'Haber',
      priority: null,
      isPinned: false,
      sortWeight: 0,
      sortDate: new Date(item.publishedAt ?? item.createdAt).getTime(),
    })),
  ]

  return feed
    .sort((left, right) => {
      if (left.sortWeight !== right.sortWeight) {
        return right.sortWeight - left.sortWeight
      }

      if (left.sortDate !== right.sortDate) {
        return right.sortDate - left.sortDate
      }

      return left.id.localeCompare(right.id)
    })
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      summary: item.summary,
      dateLabel: item.dateLabel,
      href: item.href,
      imageUrl: item.imageUrl,
      badgeLabel: item.badgeLabel,
      priority: item.priority,
      isPinned: item.isPinned,
    }))
}

export async function listAdminUpdatesSnapshot(): Promise<UpdatesAdminSnapshot> {
  const client = requireClient()

  const [newsResponse, announcementsResponse] = await Promise.all([
    client
      .from(NEWS_TABLE)
      .select('id, title, slug, summary, content, image_url, published_at, is_active, sort_order, status, created_at, updated_at')
      .order('updated_at', { ascending: false }),
    client
      .from(ANNOUNCEMENTS_TABLE)
      .select('id, title, slug, summary, content, image_url, priority, is_pinned, is_active, start_date, end_date, published_at, sort_order, status, created_at, updated_at')
      .order('updated_at', { ascending: false }),
  ])

  if (newsResponse.error) {
    throw new Error('Admin haber listesi okunamadi.')
  }

  if (announcementsResponse.error) {
    throw new Error('Admin duyuru listesi okunamadi.')
  }

  return {
    news: ((newsResponse.data ?? []) as NewsRow[]).map(mapNews),
    announcements: ((announcementsResponse.data ?? []) as AnnouncementRow[]).map(mapAnnouncement),
  }
}

function normalizeNewsInput(input: NewsInput, currentId?: string) {
  return Promise.all([
    ensureUniqueSlug(NEWS_TABLE, input.title, currentId, input.slug),
  ]).then(([slug]) => ({
    title: normalizeRequiredText(input.title, 'Haber basligi zorunlu.'),
    slug,
    summary: normalizeRequiredText(input.summary, 'Haber ozeti zorunlu.'),
    content: normalizeRequiredText(input.content, 'Haber icerigi zorunlu.'),
    image_url: normalizeNullableText(input.imageUrl),
    published_at:
      input.status === 'published'
        ? normalizeDate(input.publishedAt) ?? new Date().toISOString()
        : normalizeDate(input.publishedAt),
    is_active: input.isActive,
    sort_order: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    status: input.status,
  }))
}

function normalizeAnnouncementInput(input: AnnouncementInput, currentId?: string) {
  return Promise.all([
    ensureUniqueSlug(ANNOUNCEMENTS_TABLE, input.title, currentId, input.slug),
  ]).then(([slug]) => {
    const startDate = normalizeDate(input.startDate)
    const endDate = normalizeDate(input.endDate)

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error('Duyuru bitis tarihi baslangic tarihinden once olamaz.')
    }

    return {
      title: normalizeRequiredText(input.title, 'Duyuru basligi zorunlu.'),
      slug,
      summary: normalizeRequiredText(input.summary, 'Duyuru ozeti zorunlu.'),
      content: normalizeRequiredText(input.content, 'Duyuru icerigi zorunlu.'),
      image_url: normalizeNullableText(input.imageUrl),
      priority: input.priority,
      is_pinned: input.isPinned,
      is_active: input.isActive,
      start_date: startDate,
      end_date: endDate,
      published_at:
        input.status === 'published'
          ? normalizeDate(input.publishedAt) ?? new Date().toISOString()
          : normalizeDate(input.publishedAt),
      sort_order: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
      status: input.status,
    }
  })
}

export async function createNews(input: NewsInput) {
  const client = requireClient()
  const payload = await normalizeNewsInput(input)
  const { error } = await client.from(NEWS_TABLE).insert(payload)

  if (error) {
    throw new Error('Haber kaydi olusturulamadi.')
  }
}

export async function updateNews(id: string, input: NewsInput) {
  const client = requireClient()
  const payload = await normalizeNewsInput(input, id)
  const { error } = await client.from(NEWS_TABLE).update(payload).eq('id', id)

  if (error) {
    throw new Error('Haber kaydi guncellenemedi.')
  }
}

export async function archiveNews(id: string) {
  const client = requireClient()
  const { error } = await client.from(NEWS_TABLE).update({ status: 'archived', is_active: false }).eq('id', id)

  if (error) {
    throw new Error('Haber arsivlenemedi.')
  }
}

export async function createAnnouncement(input: AnnouncementInput) {
  const client = requireClient()
  const payload = await normalizeAnnouncementInput(input)
  const { error } = await client.from(ANNOUNCEMENTS_TABLE).insert(payload)

  if (error) {
    throw new Error('Duyuru kaydi olusturulamadi.')
  }
}

export async function updateAnnouncement(id: string, input: AnnouncementInput) {
  const client = requireClient()
  const payload = await normalizeAnnouncementInput(input, id)
  const { error } = await client.from(ANNOUNCEMENTS_TABLE).update(payload).eq('id', id)

  if (error) {
    throw new Error('Duyuru kaydi guncellenemedi.')
  }
}

export async function archiveAnnouncement(id: string) {
  const client = requireClient()
  const { error } = await client.from(ANNOUNCEMENTS_TABLE).update({ status: 'archived', is_active: false }).eq('id', id)

  if (error) {
    throw new Error('Duyuru arsivlenemedi.')
  }
}

export async function getNewsBySlug(slug: string) {
  const client = requireClient()
  const { data, error } = await client
    .from(NEWS_TABLE)
    .select('id, title, slug, summary, content, image_url, published_at, is_active, sort_order, status, created_at, updated_at')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error('Haber detayi okunamadi.')
  }

  const item = data ? mapNews(data as NewsRow) : null
  if (!item || !isNewsCurrentlyVisible(item)) {
    return null
  }

  return item
}

export async function getAnnouncementBySlug(slug: string) {
  const client = requireClient()
  const { data, error } = await client
    .from(ANNOUNCEMENTS_TABLE)
    .select('id, title, slug, summary, content, image_url, priority, is_pinned, is_active, start_date, end_date, published_at, sort_order, status, created_at, updated_at')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error('Duyuru detayi okunamadi.')
  }

  const item = data ? mapAnnouncement(data as AnnouncementRow) : null
  if (!item || !isAnnouncementCurrentlyVisible(item)) {
    return null
  }

  return item
}