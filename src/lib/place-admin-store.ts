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
    throw new Error('Supabase admin baglantisi hazir degil.')
  }

  const [places, totalPlaces, publishedPlaces, draftPlaces, sweepedPlaces] = await Promise.all([
    fetchExistingPlaces(client, limit),
    countRows(client, (query) => query),
    countRows(client, (query) => query.eq('status', 'published')),
    countRows(client, (query) => query.neq('status', 'published')),
    countRows(client, (query) => query.eq('is_sweeped', true)),
  ])

  return {
    places,
    stats: {
      totalPlaces,
      publishedPlaces,
      draftPlaces,
      sweepedPlaces,
    },
    categoryOptions: PLACE_CATEGORY_OPTIONS.map((option) => ({ id: option.id, label: option.label })),
  }
}

export async function applyAdminPlaceAction(input: {
  placeId: string
  draft: PlaceEditorDraft
}): Promise<AdminPlacesSnapshot> {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin baglantisi hazir degil.')
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
    throw new Error('Sayac okunamadi: places')
  }

  return response.count ?? 0
}

export type { ExistingPlaceItem }
