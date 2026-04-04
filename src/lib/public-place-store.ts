import 'server-only'

import { getSupabaseAdminClient } from '@/lib/supabase-admin'

type PlaceImageRecord = {
  url?: string | null
  is_cover?: boolean | null
  sort_order?: number | null
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
  images: PlaceImageRecord[] | null
}

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

export async function listPublishedPlacesByCategory(categoryId: string, limit = 12) {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin bağlantısı hazır değil.')
  }

  const { data, error } = await client
    .from('places')
    .select(
      'id, slug, name, headline, short_description, category_primary, address, phone, website, images',
    )
    .eq('status', 'published')
    .eq('category_primary', categoryId)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error('Yayındaki mekanlar okunamadı.')
  }

  return ((data ?? []) as PlaceRow[]).map((place) => ({
    id: place.id,
    slug: place.slug ?? place.id,
    name: place.name,
    headline: place.headline || place.name,
    shortDescription: place.short_description || `${place.name} Kaş Guide yayın listesinde yer alıyor.`,
    categoryPrimary: place.category_primary,
    address: place.address,
    phone: place.phone,
    website: place.website,
    imageUrl: getImageUrls(place.images)[0] ?? null,
  }))
}

export async function getPublishedPlaceBySlug(slug: string) {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin bağlantısı hazır değil.')
  }

  const { data, error } = await client
    .from('places')
    .select(
      'id, slug, name, headline, short_description, long_description, category_primary, address, phone, website, images',
    )
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error('Mekan detayı okunamadı.')
  }

  const place = (data ?? null) as PlaceRow | null

  if (!place) {
    return null
  }

  return {
    id: place.id,
    slug: place.slug ?? place.id,
    name: place.name,
    headline: place.headline || place.name,
    shortDescription: place.short_description || `${place.name} Kaş Guide yayın listesinde yer alıyor.`,
    longDescription:
      place.long_description ||
      place.short_description ||
      `${place.name} için detaylı içerik yakında eklenecek.`,
    categoryPrimary: place.category_primary,
    address: place.address,
    phone: place.phone,
    website: place.website,
    imageUrls: getImageUrls(place.images),
  } satisfies PublicPlaceDetail
}

export async function getPublishedPlaceCountsByCategory() {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin bağlantısı hazır değil.')
  }

  const { data, error } = await client
    .from('places')
    .select('category_primary')
    .eq('status', 'published')

  if (error) {
    throw new Error('Kategori sayıları okunamadı.')
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
