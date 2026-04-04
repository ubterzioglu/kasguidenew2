import 'server-only'

import type { PlaceEditorDraft, RecentRawPlaceItem, ExistingPlaceItem } from '@/types/review'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

import {
  buildDraftFromRaw,
  buildDraftFromPlace,
  mapRecentRawPlaceRow,
  type RecentRawPlaceRow,
  type PlaceSourceRow,
  type PlaceRow,
  type PlaceContentRow,
  type PlaceImageRow,
} from './place-draft-builder'
import { isMissingKasguideBadgeColumnError } from './place-persistence'

// Re-export public types consumed by place-review-store and API routes.
export type { PlaceEditorDraft, RecentRawPlaceItem, ExistingPlaceItem } from '@/types/review'

// RawPlaceSaveAction is specific to the raw-place pipeline action discriminator.
export type RawPlaceSaveAction = 'save_draft' | 'publish' | 'reject'

// Re-export write operations — import paths unchanged for existing consumers.
export {
  updateRawPlaceStatus,
  rejectRawPlace,
  persistPlaceFromRaw,
  persistExistingPlace,
} from './place-persistence'

// ── Fetch operations ──────────────────────────────────────────────────────────

export async function fetchExistingPlaces(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  limit: number,
): Promise<ExistingPlaceItem[]> {
  const placeResultWithBadge = await client
    .from('places')
    .select('id, slug, name, kasguide_badge, category_primary, address, phone, website, status, verification_status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)

  let placeData = (placeResultWithBadge.data ?? null) as PlaceRow[] | null
  let placeError = placeResultWithBadge.error

  if (placeError && isMissingKasguideBadgeColumnError(placeError)) {
    const fallbackResult = await client
      .from('places')
      .select('id, slug, name, category_primary, address, phone, website, status, verification_status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limit)

    placeData = (fallbackResult.data ?? null) as PlaceRow[] | null
    placeError = fallbackResult.error
  }

  if (placeError) {
    throw new Error('Mevcut mekan kayıtları okunamadı.')
  }

  const places = (placeData ?? []) as PlaceRow[]
  const placeIds = places.map((place) => place.id)

  if (placeIds.length === 0) {
    return []
  }

  if (placeIds.length > 120) {
    const contentRows: PlaceContentRow[] = []
    const imageRows: PlaceImageRow[] = []
    const chunkSize = 120

    for (let index = 0; index < placeIds.length; index += chunkSize) {
      const chunk = placeIds.slice(index, index + chunkSize)
      const [contentResult, imagesResult] = await Promise.all([
        client
          .from('place_content')
          .select('place_id, headline, short_text, long_text')
          .in('place_id', chunk),
        client
          .from('place_images')
          .select('place_id, public_url, storage_path, sort_order')
          .in('place_id', chunk)
          .order('sort_order', { ascending: true }),
      ])

      if (contentResult.error) {
        throw new Error(`Mevcut mekan icerikleri okunamadi: ${contentResult.error.message}`)
      }

      if (imagesResult.error) {
        throw new Error(`Mevcut mekan gorselleri okunamadi: ${imagesResult.error.message}`)
      }

      contentRows.push(...((contentResult.data ?? []) as PlaceContentRow[]))
      imageRows.push(...((imagesResult.data ?? []) as PlaceImageRow[]))
    }

    const contentMap = new Map<string, PlaceContentRow>()
    const imageMap = new Map<string, string[]>()

    for (const row of contentRows) {
      contentMap.set(row.place_id, row)
    }

    for (const row of imageRows) {
      const current = imageMap.get(row.place_id) ?? []
      current.push(row.public_url || row.storage_path)
      imageMap.set(row.place_id, current)
    }

    return places.map((place) => ({
      id: place.id,
      updatedAt: place.updated_at ?? new Date().toISOString(),
      draft: buildDraftFromPlace(place, contentMap.get(place.id) ?? null, imageMap.get(place.id) ?? []),
    }))
  }

  const [contentResult, imagesResult] = await Promise.all([
    client
      .from('place_content')
      .select('place_id, headline, short_text, long_text')
      .in('place_id', placeIds),
    client
      .from('place_images')
      .select('place_id, public_url, storage_path, sort_order')
      .in('place_id', placeIds)
      .order('sort_order', { ascending: true }),
  ])

  if (contentResult.error) {
    throw new Error('Mevcut mekan içerikleri okunamadı.')
  }

  if (imagesResult.error) {
    throw new Error('Mevcut mekan görselleri okunamadı.')
  }

  const contentMap = new Map<string, PlaceContentRow>()
  const imageMap = new Map<string, string[]>()

  for (const row of (contentResult.data ?? []) as PlaceContentRow[]) {
    contentMap.set(row.place_id, row)
  }

  for (const row of (imagesResult.data ?? []) as PlaceImageRow[]) {
    const current = imageMap.get(row.place_id) ?? []
    current.push(row.public_url || row.storage_path)
    imageMap.set(row.place_id, current)
  }

  return places.map((place) => ({
    id: place.id,
    updatedAt: place.updated_at ?? new Date().toISOString(),
    draft: buildDraftFromPlace(place, contentMap.get(place.id) ?? null, imageMap.get(place.id) ?? []),
  }))
}

export async function fetchRecentRawPlaces(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  limit: number,
): Promise<RecentRawPlaceItem[]> {
  const { data, error } = await client
    .from('raw_places')
    .select(
      `
        id,
        source_name,
        source_id,
        name_raw,
        lat,
        lng,
        address_raw,
        phone_raw,
        website_raw,
        category_raw,
        processing_status,
        imported_at,
        raw_payload
      `,
    )
    .order('imported_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error('Ham sweep sonuclari okunamadi.')
  }

  const rawRows = (data ?? []) as RecentRawPlaceRow[]
  const draftMap = await loadDraftMapForRawPlaces(client, rawRows)

  return rawRows.map((row) => mapRecentRawPlaceRow(row, draftMap.get(row.id) ?? null))
}

export async function loadDraftMapForRawPlaces(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  rawRows: RecentRawPlaceRow[],
): Promise<Map<string, PlaceEditorDraft>> {
  const map = new Map<string, PlaceEditorDraft>()
  const rawIds = rawRows.map((row) => row.id)

  if (rawIds.length === 0) {
    return map
  }

  const { data: sources, error: sourcesError } = await client
    .from('place_sources')
    .select('raw_place_id, place_id')
    .in('raw_place_id', rawIds)

  if (sourcesError) {
    throw new Error('Mekan kaynaklari okunamadi.')
  }

  const sourceRows = (sources ?? []) as PlaceSourceRow[]
  const placeIds = Array.from(new Set(sourceRows.map((row) => row.place_id)))

  const placeRows = new Map<string, PlaceRow>()
  const contentRows = new Map<string, PlaceContentRow>()
  const imageRows = new Map<string, string[]>()

  if (placeIds.length > 0) {
    const placesResultWithBadge = await client
      .from('places')
      .select('id, slug, name, kasguide_badge, category_primary, address, phone, website, status, verification_status')
      .in('id', placeIds)

    let placesData = (placesResultWithBadge.data ?? null) as PlaceRow[] | null
    let placesError = placesResultWithBadge.error

    if (placesError && isMissingKasguideBadgeColumnError(placesError)) {
      const fallbackPlacesResult = await client
        .from('places')
        .select('id, slug, name, category_primary, address, phone, website, status, verification_status')
        .in('id', placeIds)

      placesData = (fallbackPlacesResult.data ?? null) as PlaceRow[] | null
      placesError = fallbackPlacesResult.error
    }

    const [contentResult, imagesResult] = await Promise.all([
      client
        .from('place_content')
        .select('place_id, headline, short_text, long_text')
        .in('place_id', placeIds),
      client
        .from('place_images')
        .select('place_id, public_url, storage_path, sort_order')
        .in('place_id', placeIds)
        .order('sort_order', { ascending: true }),
    ])

    if (placesError) {
      throw new Error('Mekan kayıtları okunamadı.')
    }

    if (contentResult.error) {
      throw new Error('Mekan icerikleri okunamadi.')
    }

    if (imagesResult.error) {
      throw new Error('Mekan gorselleri okunamadi.')
    }

    for (const row of (placesData ?? []) as PlaceRow[]) {
      placeRows.set(row.id, row)
    }

    for (const row of (contentResult.data ?? []) as PlaceContentRow[]) {
      contentRows.set(row.place_id, row)
    }

    for (const row of (imagesResult.data ?? []) as PlaceImageRow[]) {
      const current = imageRows.get(row.place_id) ?? []
      current.push(row.public_url || row.storage_path)
      imageRows.set(row.place_id, current)
    }
  }

  for (const rawRow of rawRows) {
    const relatedSource = sourceRows.find((item) => item.raw_place_id === rawRow.id) ?? null
    const place = relatedSource ? (placeRows.get(relatedSource.place_id) ?? null) : null
    const content = place ? (contentRows.get(place.id) ?? null) : null
    const images = place ? (imageRows.get(place.id) ?? []) : []

    map.set(rawRow.id, buildDraftFromRaw(rawRow, place, content, images))
  }

  return map
}
