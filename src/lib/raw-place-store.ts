import 'server-only'

import type { ExistingPlaceItem, PlaceEditorDraft, RecentRawPlaceItem } from '@/types/review'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

import {
  buildDraftFromUnifiedRow,
  mapRecentRawPlaceRow,
  type UnifiedPlaceRow,
} from './place-draft-builder'

// Re-export public types consumed by place-review-store and API routes.
export type { PlaceEditorDraft, RecentRawPlaceItem, ExistingPlaceItem } from '@/types/review'

export type RawPlaceSaveAction = 'save_draft' | 'publish' | 'reject'

export {
  updateRawPlaceStatus,
  rejectRawPlace,
  persistPlaceFromRaw,
  persistExistingPlace,
} from './place-persistence'

const PLACE_SELECT_EXTENDED = `
  id,
  slug,
  name,
  kasguide_badge,
  kasguide_badges,
  category_primary,
  category_ids,
  address,
  lat,
  lng,
  phone,
  website,
  opening_hours,
  status,
  verification_status,
  updated_at,
  imported_at,
  primary_source_name,
  primary_source_id,
  source_url,
  grid_key,
  cell_id,
  google_maps_uri,
  intake_channel,
  is_sweeped,
  source_sweep_id,
  review_reason,
  review_notes,
  review_score,
  merge_target_place_id,
  headline,
  short_description,
  long_description,
  images,
  source_records,
  raw_snapshot
`

const PLACE_SELECT_LEGACY = `
  id,
  slug,
  name,
  kasguide_badge,
  category_primary,
  address,
  lat,
  lng,
  phone,
  website,
  opening_hours,
  status,
  verification_status,
  updated_at,
  imported_at,
  primary_source_name,
  primary_source_id,
  source_url,
  grid_key,
  cell_id,
  google_maps_uri,
  intake_channel,
  is_sweeped,
  source_sweep_id,
  review_reason,
  review_notes,
  review_score,
  merge_target_place_id,
  headline,
  short_description,
  long_description,
  images,
  source_records,
  raw_snapshot
`

type SelectError = {
  message?: string | null
  details?: string | null
  hint?: string | null
} | null

function isMissingExtendedPlacesColumn(error: SelectError) {
  const text = `${error?.message ?? ''} ${error?.details ?? ''} ${error?.hint ?? ''}`.toLowerCase()
  return text.includes('category_ids') || text.includes('kasguide_badges')
}

async function runPlacesQueryWithFallback<T>(
  buildQuery: (selectClause: string) => PromiseLike<{ data: T[] | null; error: SelectError } | unknown>,
) {
  let response = (await buildQuery(PLACE_SELECT_EXTENDED)) as { data: T[] | null; error: SelectError }

  if (response.error && isMissingExtendedPlacesColumn(response.error)) {
    response = (await buildQuery(PLACE_SELECT_LEGACY)) as { data: T[] | null; error: SelectError }
  }

  return response
}

export async function fetchExistingPlaces(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  limit: number,
): Promise<ExistingPlaceItem[]> {
  const { data, error } = await runPlacesQueryWithFallback<UnifiedPlaceRow>((selectClause) =>
    client
      .from('places')
      .select(selectClause)
      .order('updated_at', { ascending: false })
      .limit(limit),
  )

  if (error) {
    throw new Error('Mevcut mekan kayıtları okunamadı.')
  }

  return ((data ?? []) as UnifiedPlaceRow[]).map((place) => ({
    id: place.id,
    intakeChannel: place.intake_channel ?? 'manual',
    isSweeped: place.is_sweeped ?? false,
    sweepId: place.source_sweep_id ?? null,
    sourceName: place.primary_source_name ?? null,
    sourceId: place.primary_source_id ?? null,
    updatedAt: place.updated_at ?? new Date().toISOString(),
    draft: buildDraftFromUnifiedRow(place),
  }))
}

export async function fetchRecentRawPlaces(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  limit: number,
): Promise<RecentRawPlaceItem[]> {
  const { data, error } = await runPlacesQueryWithFallback<UnifiedPlaceRow>((selectClause) =>
    client
      .from('places')
      .select(selectClause)
      .eq('is_sweeped', true)
      .order('imported_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false })
      .limit(limit),
  )

  if (error) {
    throw new Error('Ham sweep sonuçları okunamadı.')
  }

  return ((data ?? []) as UnifiedPlaceRow[]).map((row) => mapRecentRawPlaceRow(row))
}

export async function loadDraftMapForRawPlaces(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  rawRows: Array<{ id: string }>,
): Promise<Map<string, PlaceEditorDraft>> {
  const ids = rawRows.map((row) => row.id)
  const map = new Map<string, PlaceEditorDraft>()

  if (ids.length === 0) {
    return map
  }

  const { data, error } = await runPlacesQueryWithFallback<UnifiedPlaceRow>((selectClause) =>
    client.from('places').select(selectClause).in('id', ids),
  )

  if (error) {
    throw new Error('Mekan kayıtları okunamadı.')
  }

  for (const place of (data ?? []) as UnifiedPlaceRow[]) {
    map.set(place.id, buildDraftFromUnifiedRow(place))
  }

  return map
}
