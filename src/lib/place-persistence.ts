import 'server-only'

import { randomUUID } from 'node:crypto'

import type { PlaceEditorDraft, PlaceStatus } from '@/types/review'
import { PLACE_CATEGORY_OPTIONS } from '@/lib/place-taxonomy'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

import { normalizePhone, normalizeText, normalizeWebsite, slugifyText, uniqueImageUrls } from './place-review-utils'

type ImageRecord = {
  url: string
  alt_text: string | null
  source_name: string
  is_cover: boolean
  sort_order: number
}

type SourceRecord = {
  source_name: string
  source_id: string
  source_url: string | null
  is_primary: boolean
  first_seen_at: string
  last_seen_at: string
  raw_place_id: string | null
}

type PlaceRow = {
  id: string
  slug: string | null
  name: string
  lat: number | null
  lng: number | null
  imported_at: string | null
  primary_source_name: string | null
  primary_source_id: string | null
  source_url: string | null
  source_records: SourceRecord[] | null
  raw_snapshot: Record<string, unknown> | null
  grid_key: string | null
  cell_id: string | null
  google_maps_uri: string | null
  intake_channel: string | null
  is_sweeped: boolean | null
  source_sweep_id: string | null
  category_ids: string[] | null
  kasguide_badges: string[] | null
}

const DEFAULT_PLACE_IMAGE_URL = '/kasplaceholder.jpg'

type SelectError = {
  message?: string | null
  details?: string | null
  hint?: string | null
} | null

const PLACE_SELECT_EXTENDED =
  'id, slug, name, lat, lng, imported_at, primary_source_name, primary_source_id, source_url, source_records, raw_snapshot, grid_key, cell_id, google_maps_uri, intake_channel, is_sweeped, source_sweep_id, category_ids, kasguide_badges'

const PLACE_SELECT_LEGACY =
  'id, slug, name, lat, lng, imported_at, primary_source_name, primary_source_id, source_url, source_records, raw_snapshot, grid_key, cell_id, google_maps_uri, intake_channel, is_sweeped, source_sweep_id'

function isMissingExtendedPlacesColumn(error: SelectError) {
  const text = `${error?.message ?? ''} ${error?.details ?? ''} ${error?.hint ?? ''}`.toLowerCase()
  return text.includes('category_ids') || text.includes('kasguide_badges')
}

async function selectPlaceWithSchemaFallback(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  placeId: string,
): Promise<{ place: PlaceRow; supportsExtendedColumns: boolean }> {
  const extendedResponse = await client.from('places').select(PLACE_SELECT_EXTENDED).eq('id', placeId).maybeSingle()

  if (!extendedResponse.error && extendedResponse.data) {
    return {
      place: extendedResponse.data as PlaceRow,
      supportsExtendedColumns: true,
    }
  }

  if (!isMissingExtendedPlacesColumn(extendedResponse.error)) {
    throw new Error('Mekan kaydi bulunamadi.')
  }

  const legacyResponse = await client.from('places').select(PLACE_SELECT_LEGACY).eq('id', placeId).maybeSingle()

  if (legacyResponse.error || !legacyResponse.data) {
    throw new Error('Mekan kaydi bulunamadi.')
  }

  return {
    place: {
      ...(legacyResponse.data as Omit<PlaceRow, 'category_ids' | 'kasguide_badges'>),
      category_ids: null,
      kasguide_badges: null,
    },
    supportsExtendedColumns: false,
  }
}

function buildPlaceUpdatePayload(
  normalized: ReturnType<typeof validateDraft>,
  draft: PlaceEditorDraft,
  existingRawSnapshot: Record<string, unknown> | null | undefined,
  supportsExtendedColumns: boolean,
) {
  const payload: Record<string, unknown> = {
    slug: draft.slug,
    name: normalized.normalizedName,
    headline: normalized.normalizedHeadline,
    short_description: normalized.normalizedShortDescription,
    long_description: normalized.normalizedLongDescription,
    kasguide_badge: normalized.normalizedKasguideBadgePrimary,
    category_primary: normalized.normalizedCategoryPrimary,
    category_secondary: null,
    address: normalized.normalizedAddress,
    phone: normalized.normalizedPhone,
    website: normalized.normalizedWebsite,
    status: normalizeStatus(draft.status),
    verification_status: draft.verificationStatus,
    images: buildImages(normalized.normalizedName, normalized.normalizedImages),
    review_notes: 'Mevcut mekan admin panelinden guncellendi.',
    raw_snapshot: {
      ...(existingRawSnapshot ?? {}),
      last_admin_save_at: new Date().toISOString(),
    },
  }

  if (supportsExtendedColumns) {
    payload.kasguide_badges = normalized.normalizedKasguideBadges
    payload.category_ids = normalized.normalizedCategoryIds
  }

  return payload
}

function normalizeStatus(status: PlaceStatus, publish = false): PlaceStatus {
  if (publish) {
    return 'published'
  }

  if (status === 'pending' || status === 'error' || status === 'rejected' || status === 'merged') {
    return 'review'
  }

  if (status === 'published') {
    return 'published'
  }

  return status
}

async function ensureUniqueSlug(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  baseSlug: string,
  currentPlaceId: string,
): Promise<string> {
  let slug = baseSlug
  let suffix = 1

  while (true) {
    const { data, error } = await client.from('places').select('id, slug').eq('slug', slug).maybeSingle()

    if (error) {
      throw new Error('Slug benzersizligi kontrol edilemedi.')
    }

    const existing = data as { id: string; slug: string } | null

    if (!existing || existing.id === currentPlaceId) {
      return slug
    }

    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }
}

function buildImages(name: string, imageUrls: string[]): ImageRecord[] {
  return imageUrls.map((url, index) => ({
    url,
    alt_text: `${name} fotograf ${index + 1}`,
    source_name: 'admin_manual',
    is_cover: index === 0,
    sort_order: index,
  }))
}

function mergeSourceRecords(existing: SourceRecord[] | null | undefined, incoming: SourceRecord | null) {
  const map = new Map<string, SourceRecord>()

  for (const record of existing ?? []) {
    if (!record.source_name || !record.source_id) {
      continue
    }

    map.set(`${record.source_name}:${record.source_id}`, record)
  }

  if (incoming) {
    map.set(`${incoming.source_name}:${incoming.source_id}`, incoming)
  }

  return [...map.values()].sort((left, right) => {
    const leftPrimary = left.is_primary ? 0 : 1
    const rightPrimary = right.is_primary ? 0 : 1
    return leftPrimary - rightPrimary
  })
}

function uniqueTokens(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => normalizeText(value) ?? '').filter(Boolean))]
}

function validateDraft(draft: PlaceEditorDraft) {
  const normalizedName = normalizeText(draft.name)
  const normalizedCategoryIds = uniqueTokens(draft.categoryIds)
  const normalizedImages = uniqueImageUrls(draft.imageUrls)
  const normalizedKasguideBadges = uniqueTokens(draft.kasguideBadges)

  if (!normalizedName) {
    throw new Error('Mekan adi zorunlu.')
  }

  if (normalizedCategoryIds.length === 0) {
    throw new Error('Kategori secilmesi zorunlu.')
  }

  if (!normalizedCategoryIds.every((categoryId) => PLACE_CATEGORY_OPTIONS.some((option) => option.id === categoryId))) {
    throw new Error('Gecersiz kategori secimi.')
  }

  if (normalizedImages.length > 5) {
    throw new Error('Her mekan icin en az 1, en fazla 5 foto gerekli.')
  }

  const normalizedImagesWithFallback =
    normalizedImages.length > 0 ? normalizedImages : [DEFAULT_PLACE_IMAGE_URL]

  return {
    normalizedName,
    normalizedCategoryIds,
    normalizedCategoryPrimary: normalizedCategoryIds[0] ?? 'gezi',
    normalizedHeadline: normalizedName,
    normalizedShortDescription: normalizeText(draft.shortDescription) || normalizedName,
    normalizedLongDescription: normalizeText(draft.longDescription) || '',
    normalizedKasguideBadges,
    normalizedKasguideBadgePrimary: normalizedKasguideBadges[0] ?? '',
    normalizedAddress: normalizeText(draft.address),
    normalizedPhone: normalizePhone(draft.phone),
    normalizedWebsite: normalizeWebsite(draft.website),
    normalizedImages: normalizedImagesWithFallback,
  }
}

export async function updateRawPlaceStatus(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  rawPlaceId: string,
  status: 'review' | 'rejected' | 'normalized',
): Promise<void> {
  const placeStatus: PlaceStatus =
    status === 'normalized' ? 'admin' : status === 'rejected' ? 'rejected' : 'review'

  const { error } = await client.from('places').update({ status: placeStatus }).eq('id', rawPlaceId)

  if (error) {
    throw new Error('Ham kayit durumu guncellenemedi.')
  }
}

export async function rejectRawPlace(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  rawPlaceId: string,
): Promise<void> {
  const { error } = await client
    .from('places')
    .update({
      status: 'rejected',
      review_notes: 'Admin panelinden reddedildi.',
      verification_status: 'rejected',
    })
    .eq('id', rawPlaceId)

  if (error) {
    throw new Error('Mekan kaydi reddedilemedi.')
  }
}

export async function persistPlaceFromRaw(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  input: {
    rawPlaceId: string
    draft: PlaceEditorDraft
    publish: boolean
  },
): Promise<void> {
  const { place: rawPlace, supportsExtendedColumns } = await selectPlaceWithSchemaFallback(client, input.rawPlaceId)
  const normalized = validateDraft(input.draft)
  const placeId = input.draft.placeId ?? rawPlace.id ?? randomUUID()
  const slugBase =
    slugifyText(input.draft.slug || normalized.normalizedName) || `place-${placeId.slice(0, 8)}`
  const slug = await ensureUniqueSlug(client, slugBase, placeId)
  const sourceRecord =
    rawPlace.primary_source_name && rawPlace.primary_source_id
      ? {
          source_name: rawPlace.primary_source_name,
          source_id: rawPlace.primary_source_id,
          source_url: rawPlace.source_url,
          is_primary: true,
          first_seen_at: rawPlace.imported_at ?? new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          raw_place_id: rawPlace.id,
        }
      : null

  const payload: Record<string, unknown> = {
    id: placeId,
    slug,
    name: normalized.normalizedName,
    headline: normalized.normalizedHeadline,
    short_description: normalized.normalizedShortDescription,
    long_description: normalized.normalizedLongDescription,
    kasguide_badge: normalized.normalizedKasguideBadgePrimary,
    category_primary: normalized.normalizedCategoryPrimary,
    category_secondary: null,
    address: normalized.normalizedAddress,
    lat: rawPlace.lat,
    lng: rawPlace.lng,
    phone: normalized.normalizedPhone,
    website: normalized.normalizedWebsite,
    opening_hours: null,
    status: input.publish ? 'published' : 'admin',
    verification_status: input.publish ? 'verified' : 'reviewed',
    primary_source_name: rawPlace.primary_source_name,
    primary_source_id: rawPlace.primary_source_id,
    source_url: rawPlace.source_url,
    imported_at: rawPlace.imported_at,
    grid_key: rawPlace.grid_key,
    cell_id: rawPlace.cell_id,
    google_maps_uri: rawPlace.google_maps_uri,
    intake_channel: rawPlace.intake_channel ?? (rawPlace.is_sweeped ? 'sweep' : 'manual'),
    is_sweeped: rawPlace.is_sweeped ?? false,
    source_sweep_id: rawPlace.source_sweep_id,
    review_reason: rawPlace.raw_snapshot?.review_reason ?? 'Admin panelinden duzenlendi.',
    review_notes: input.publish
      ? 'Admin panelinden onaylanip yayina alindi.'
      : 'Admin panelinde duzenleniyor.',
    review_score: rawPlace.raw_snapshot?.review_score ?? null,
    merge_target_place_id: null,
    images: buildImages(normalized.normalizedName, normalized.normalizedImages),
    source_records: mergeSourceRecords(rawPlace.source_records, sourceRecord),
    raw_snapshot: {
      ...(rawPlace.raw_snapshot ?? {}),
      name_raw: rawPlace.raw_snapshot?.name_raw ?? rawPlace.name,
      address_raw: rawPlace.raw_snapshot?.address_raw ?? rawPlace.name,
      phone_raw: rawPlace.raw_snapshot?.phone_raw ?? normalized.normalizedPhone,
      website_raw: rawPlace.raw_snapshot?.website_raw ?? normalized.normalizedWebsite,
      category_raw: rawPlace.raw_snapshot?.category_raw ?? normalized.normalizedCategoryPrimary,
      last_admin_save_at: new Date().toISOString(),
    },
  }

  if (supportsExtendedColumns) {
    payload.kasguide_badges = normalized.normalizedKasguideBadges
    payload.category_ids = normalized.normalizedCategoryIds
  }

  const { error: upsertError } = await client.from('places').upsert(payload, { onConflict: 'id' })

  if (upsertError) {
    throw new Error('Mekan kaydi kaydedilemedi.')
  }
}

export async function persistExistingPlace(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  input: {
    placeId: string
    draft: PlaceEditorDraft
  },
): Promise<void> {
  const { place: existing, supportsExtendedColumns } = await selectPlaceWithSchemaFallback(client, input.placeId)

  const normalized = validateDraft(input.draft)
  const slugBase =
    slugifyText(input.draft.slug || normalized.normalizedName) || `place-${input.placeId.slice(0, 8)}`
  const slug = await ensureUniqueSlug(client, slugBase, input.placeId)

  const payload = buildPlaceUpdatePayload(
    normalized,
    {
      ...input.draft,
      slug,
    },
    (existing.raw_snapshot as Record<string, unknown> | null | undefined) ?? null,
    supportsExtendedColumns,
  )

  const { error } = await client
    .from('places')
    .update(payload)
    .eq('id', input.placeId)

  if (error) {
    throw new Error('Mevcut mekan kaydi guncellenemedi.')
  }
}
