import 'server-only'

import { PLACE_CATEGORY_OPTIONS } from '@/lib/place-taxonomy'
import type { AdminPlacesSnapshot, ExistingPlaceItem, PlaceEditorDraft } from '@/types/review'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

import { fetchExistingPlaces, persistExistingPlace } from './raw-place-store'

export function isPlaceAdminStoreConfigured() {
  return Boolean(getSupabaseAdminClient())
}

export async function getAdminPlacesSnapshot(limit = 1000): Promise<AdminPlacesSnapshot> {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin bağlantısı hazır değil.')
  }

  const [places, totalPlaces, publishedPlaces, draftPlaces, badgeOptions] = await Promise.all([
    fetchExistingPlaces(client, limit),
    countRows(client, (query) => query),
    countRows(client, (query) => query.eq('status', 'published')),
    countRows(client, (query) => query.neq('status', 'published')),
    fetchBadgeOptions(client),
  ])

  return {
    places,
    stats: {
      totalPlaces,
      publishedPlaces,
      draftPlaces,
    },
    categoryOptions: PLACE_CATEGORY_OPTIONS.map((option) => ({ id: option.id, label: option.label })),
    badgeOptions,
  }
}

export async function applyAdminPlaceAction(input: {
  placeId: string
  draft: PlaceEditorDraft
}): Promise<AdminPlacesSnapshot> {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin bağlantısı hazır değil.')
  }

  await persistExistingPlace(client, {
    placeId: input.placeId,
    draft: input.draft,
  })

  return getAdminPlacesSnapshot()
}

async function countRows(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutate: (query: any) => any,
): Promise<number> {
  const response = await mutate(client.from('places').select('*', { count: 'exact', head: true }))

  if (response.error) {
    throw new Error('Sayaç okunamadı: places')
  }

  return response.count ?? 0
}

async function fetchBadgeOptions(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
): Promise<Array<{ id: string; label: string }>> {
  const { data, error } = await client.from('badges').select('slug, emoji, title').order('title')

  if (error) {
    throw new Error('Badge secenekleri okunamadi.')
  }

  return ((data ?? []) as Array<{ slug: string; emoji: string | null; title: string }>).map((badge) => ({
    id: badge.slug,
    label: badge.emoji?.trim() ? `${badge.emoji.trim()} ${badge.title}` : badge.title,
  }))
}

export type { ExistingPlaceItem }
