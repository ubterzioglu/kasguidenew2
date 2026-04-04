import 'server-only'

import { PLACE_CATEGORY_OPTIONS } from '@/lib/place-taxonomy'
import type { PlaceEditorDraft, SweepDashboardSnapshot } from '@/types/review'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

import { fetchGridSweeps } from './grid-sweep-store'
import {
  fetchRecentRawPlaces,
  persistPlaceFromRaw,
  rejectRawPlace,
  type RawPlaceSaveAction,
} from './raw-place-store'

export type { RawPlaceSaveAction } from './raw-place-store'

export function isPlaceSweepStoreConfigured() {
  return Boolean(getSupabaseAdminClient())
}

export async function getSweepDashboardSnapshot(limit = 276): Promise<SweepDashboardSnapshot> {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin baglantisi hazir degil.')
  }

  const [sweeps, sweepPlaces, trackedSweeps, runningSweeps, totalSweepPlaces, pendingSweepPlaces, publishedSweepPlaces] =
    await Promise.all([
      fetchGridSweeps(client, 6),
      fetchRecentRawPlaces(client, Math.max(limit, 48)),
      countRows(client, 'grid_sweeps', (query) => query),
      countRows(client, 'grid_sweeps', (query) => query.eq('status', 'running')),
      countRows(client, 'places', (query) => query.eq('is_sweeped', true)),
      countRows(client, 'places', (query) => query.eq('is_sweeped', true).in('status', ['pending', 'review', 'admin'])),
      countRows(client, 'places', (query) => query.eq('is_sweeped', true).eq('status', 'published')),
    ])

  return {
    sweeps,
    sweepPlaces,
    stats: {
      trackedSweeps,
      runningSweeps,
      sweepPlaces: totalSweepPlaces,
      pendingSweepPlaces,
      publishedSweepPlaces,
    },
    categoryOptions: PLACE_CATEGORY_OPTIONS.map((option) => ({ id: option.id, label: option.label })),
  }
}

export async function applySweepPlaceAction(input: {
  placeId: string
  action: RawPlaceSaveAction
  draft?: PlaceEditorDraft
}): Promise<SweepDashboardSnapshot> {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin baglantisi hazir degil.')
  }

  if (input.action === 'reject') {
    await rejectRawPlace(client, input.placeId)
    return getSweepDashboardSnapshot()
  }

  if (!input.draft) {
    throw new Error('Mekan taslagi gonderilmedi.')
  }

  await persistPlaceFromRaw(client, {
    rawPlaceId: input.placeId,
    draft: input.draft,
    publish: input.action === 'publish',
  })

  return getSweepDashboardSnapshot()
}

async function countRows(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  table: 'places' | 'grid_sweeps',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutate: (query: any) => any,
): Promise<number> {
  const response = await mutate(client.from(table).select('*', { count: 'exact', head: true }))

  if (response.error) {
    throw new Error(`Sayac okunamadi: ${table}`)
  }

  return response.count ?? 0
}
