import 'server-only'

import type { PublicPlaceBadge } from '@/lib/public-place-types'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

type PlaceImageRecord = {
  url?: string | null
  is_cover?: boolean | null
  sort_order?: number | null
}

type BadgeRow = {
  slug: string
  emoji: string | null
  title: string
  description: string | null
}

export type PublicPlaceListItem = {
  id: string
  slug: string
  name: string
  headline: string
  shortDescription: string
  categoryPrimary: string
  address: string | null
  phone: string | null
  website: string | null
  imageUrl: string | null
  guideBadges: PublicPlaceBadge[]
}

export type ListPublishedPlacesInput = {
  categoryIds: string[]
  limit?: number
  offset?: number
}

export type ListPublishedPlacesResult = {
  places: PublicPlaceListItem[]
  hasMore: boolean
}

export type PublicPlaceDetail = {
  id: string
  slug: string
  name: string
  headline: string
  shortDescription: string
  longDescription: string
  categoryPrimary: string
  address: string | null
  phone: string | null
  website: string | null
  imageUrls: string[]
  guideBadges: PublicPlaceBadge[]
}

type PlaceRow = {
  id: string
  slug: string | null
  name: string
  headline: string | null
  short_description: string | null
  long_description: string | null
  category_primary: string
  address: string | null
  phone: string | null
  website: string | null
  kasguide_badge: string | null
  kasguide_badges: string[] | null
  images: PlaceImageRecord[] | null
}

const DEFAULT_GUIDE_BADGE = 'recommend'

function getImageUrls(images: PlaceImageRecord[] | null | undefined) {
  return [...(images ?? [])]
    .sort((left, right) => {
      const leftCover = left.is_cover ? 0 : 1
      const rightCover = right.is_cover ? 0 : 1

      if (leftCover !== rightCover) {
        return leftCover - rightCover
      }

      return (left.sort_order ?? 999) - (right.sort_order ?? 999)
    })
    .map((image) => image.url?.trim() ?? '')
    .filter(Boolean)
}

function getBadgeFallbackIcon(icon: string | null | undefined) {
  return icon?.trim() || '\u2605'
}

function getFallbackShortDescription(placeName: string) {
  return `${placeName} Ka\u015f Guide yay\u0131n listesinde yer al\u0131yor.`
}

function getFallbackLongDescription(placeName: string) {
  return `${placeName} i\u00e7in detayl\u0131 i\u00e7erik yak\u0131nda eklenecek.`
}

function normalizeBadgeToken(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function parseBadgeTokens(rawValue: string | string[] | null | undefined) {
  const tokens = Array.isArray(rawValue)
    ? rawValue.map((value) => value.trim()).filter(Boolean)
    : (rawValue ?? '')
        .split(/[,|;/]+/)
        .map((value) => value.trim())
        .filter(Boolean)

  return tokens.length > 0 ? tokens : [DEFAULT_GUIDE_BADGE]
}

function resolveGuideBadges(rows: BadgeRow[], rawValue: string | string[] | null | undefined): PublicPlaceBadge[] {
  const seen = new Set<string>()
  const matches: PublicPlaceBadge[] = []

  for (const token of parseBadgeTokens(rawValue)) {
    const normalizedToken = normalizeBadgeToken(token)
    const match = rows.find(
      (row) =>
        normalizeBadgeToken(row.slug) === normalizedToken ||
        normalizeBadgeToken(row.title) === normalizedToken,
    )

    if (!match || seen.has(match.slug)) {
      continue
    }

    seen.add(match.slug)
    matches.push({
      slug: match.slug,
      icon: getBadgeFallbackIcon(match.emoji),
      label: match.title,
      description: match.description?.trim() || match.title,
    })
  }

  if (matches.length > 0) {
    return matches
  }

  const fallback = rows.find((row) => row.slug === DEFAULT_GUIDE_BADGE)

  if (!fallback) {
    return []
  }

  return [
    {
      slug: fallback.slug,
      icon: getBadgeFallbackIcon(fallback.emoji),
      label: fallback.title,
      description: fallback.description?.trim() || fallback.title,
    },
  ]
}

async function fetchBadgeRows() {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin ba\u011flant\u0131s\u0131 haz\u0131r de\u011fil.')
  }

  const { data, error } = await client.from('badges').select('slug, emoji, title, description')

  if (error) {
    return []
  }

  return (data ?? []) as BadgeRow[]
}

function mapPlaceListItem(place: PlaceRow, badgeRows: BadgeRow[]): PublicPlaceListItem {
  return {
    id: place.id,
    slug: place.slug ?? place.id,
    name: place.name,
    headline: place.headline || place.name,
    shortDescription: place.short_description || getFallbackShortDescription(place.name),
    categoryPrimary: place.category_primary,
    address: place.address,
    phone: place.phone,
    website: place.website,
    imageUrl: getImageUrls(place.images)[0] ?? null,
    guideBadges: resolveGuideBadges(
      badgeRows,
      place.kasguide_badges?.length ? place.kasguide_badges : place.kasguide_badge,
    ),
  }
}

export async function listPublishedPlaces(input: ListPublishedPlacesInput): Promise<ListPublishedPlacesResult> {
  const client = getSupabaseAdminClient()
  const categoryIds = [...new Set(input.categoryIds.map((item) => item.trim()).filter(Boolean))]
  const limit = Math.max(1, Math.min(input.limit ?? 12, 48))
  const offset = Math.max(0, input.offset ?? 0)

  if (!client) {
    throw new Error('Supabase admin ba\u011flant\u0131s\u0131 haz\u0131r de\u011fil.')
  }

  if (categoryIds.length === 0) {
    return {
      places: [],
      hasMore: false,
    }
  }

  let query = client
    .from('places')
    .select(
      'id, slug, name, headline, short_description, category_primary, address, phone, website, kasguide_badge, kasguide_badges, images',
    )
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  query = categoryIds.length === 1
    ? query.eq('category_primary', categoryIds[0]!)
    : query.in('category_primary', categoryIds)

  const { data, error } = await query.range(offset, offset + limit)

  if (error) {
    throw new Error('Yay\u0131ndaki mekanlar okunamad\u0131.')
  }

  const rows = (data ?? []) as PlaceRow[]
  const badgeRows = await fetchBadgeRows()

  return {
    places: rows.slice(0, limit).map((place) => mapPlaceListItem(place, badgeRows)),
    hasMore: rows.length > limit,
  }
}

export async function listPublishedPlacesByCategory(categoryId: string, limit = 12, offset = 0) {
  return listPublishedPlaces({
    categoryIds: [categoryId],
    limit,
    offset,
  })
}

export async function getPublishedPlaceBySlug(slug: string) {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin ba\u011flant\u0131s\u0131 haz\u0131r de\u011fil.')
  }

  const { data, error } = await client
    .from('places')
    .select(
      'id, slug, name, headline, short_description, long_description, category_primary, address, phone, website, kasguide_badge, kasguide_badges, images',
    )
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error('Mekan detay\u0131 okunamad\u0131.')
  }

  const place = (data ?? null) as PlaceRow | null

  if (!place) {
    return null
  }

  const badgeRows = await fetchBadgeRows()

  return {
    id: place.id,
    slug: place.slug ?? place.id,
    name: place.name,
    headline: place.headline || place.name,
    shortDescription: place.short_description || getFallbackShortDescription(place.name),
    longDescription:
      place.long_description ||
      place.short_description ||
      getFallbackLongDescription(place.name),
    categoryPrimary: place.category_primary,
    address: place.address,
    phone: place.phone,
    website: place.website,
    imageUrls: getImageUrls(place.images),
    guideBadges: resolveGuideBadges(
      badgeRows,
      place.kasguide_badges?.length ? place.kasguide_badges : place.kasguide_badge,
    ),
  } satisfies PublicPlaceDetail
}

export async function getPublishedPlaceCountsByCategory() {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin ba\u011flant\u0131s\u0131 haz\u0131r de\u011fil.')
  }

  const { data, error } = await client
    .from('places')
    .select('category_primary')
    .eq('status', 'published')

  if (error) {
    throw new Error('Kategori say\u0131lar\u0131 okunamad\u0131.')
  }

  const counts: Record<string, number> = {}

  for (const row of (data ?? []) as Array<{ category_primary: string | null }>) {
    const categoryId = row.category_primary?.trim()
    if (!categoryId) {
      continue
    }
    counts[categoryId] = (counts[categoryId] ?? 0) + 1
  }

  return counts
}


