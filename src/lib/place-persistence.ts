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
}

function normalizeStatus(status: PlaceStatus, publish = false): PlaceStatus {
  if (publish) {
    return 'published'
  }

  if (status === 'published') {
    return 'admin'
  }

  if (status === 'pending' || status === 'error' || status === 'rejected' || status === 'merged') {
    return 'review'
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

function validateDraft(draft: PlaceEditorDraft) {
  const normalizedName = normalizeText(draft.name)
  const normalizedCategory = normalizeText(draft.categoryPrimary)
  const normalizedImages = uniqueImageUrls(draft.imageUrls)

  if (!normalizedName) {
    throw new Error('Mekan adi zorunlu.')
  }

  if (!normalizedCategory) {
    throw new Error('Kategori secilmesi zorunlu.')
  }

  if (!PLACE_CATEGORY_OPTIONS.some((option) => option.id === normalizedCategory)) {
    throw new Error('Gecersiz kategori secimi.')
  }

  if (normalizedImages.length < 1 || normalizedImages.length > 5) {
    throw new Error('Her mekan icin en az 1, en fazla 5 foto gerekli.')
  }

  return {
    normalizedName,
    normalizedCategory,
    normalizedHeadline: normalizeText(draft.headline) || normalizedName,
    normalizedShortDescription: normalizeText(draft.shortDescription) || normalizedName,
    normalizedLongDescription: normalizeText(draft.longDescription) || '',
    normalizedKasguideBadge: normalizeText(draft.kasguideBadge),
    normalizedAddress: normalizeText(draft.address),
    normalizedPhone: normalizePhone(draft.phone),
    normalizedWebsite: normalizeWebsite(draft.website),
    normalizedImages,
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
  const { data, error } = await client
    .from('places')
    .select(
      'id, slug, name, lat, lng, imported_at, primary_source_name, primary_source_id, source_url, source_records, raw_snapshot, grid_key, cell_id, google_maps_uri, intake_channel, is_sweeped, source_sweep_id',
    )
    .eq('id', input.rawPlaceId)
    .maybeSingle()

  if (error || !data) {
    throw new Error('Ham mekan kaydi bulunamadi.')
  }

  const rawPlace = data as PlaceRow
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

  const payload = {
    id: placeId,
    slug,
    name: normalized.normalizedName,
    headline: normalized.normalizedHeadline,
    short_description: normalized.normalizedShortDescription,
    long_description: normalized.normalizedLongDescription,
    kasguide_badge: normalized.normalizedKasguideBadge,
    category_primary: normalized.normalizedCategory,
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
      category_raw: rawPlace.raw_snapshot?.category_raw ?? normalized.normalizedCategory,
      last_admin_save_at: new Date().toISOString(),
    },
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
  const { data: existing, error: existingError } = await client
    .from('places')
    .select(
      'id, source_records, raw_snapshot, lat, lng, imported_at, primary_source_name, primary_source_id, source_url, grid_key, cell_id, google_maps_uri, intake_channel, is_sweeped, source_sweep_id',
    )
    .eq('id', input.placeId)
    .single()

  if (existingError || !existing) {
    throw new Error('Mevcut mekan kaydi bulunamadi.')
  }

  const normalized = validateDraft(input.draft)
  const slugBase =
    slugifyText(input.draft.slug || normalized.normalizedName) || `place-${input.placeId.slice(0, 8)}`
  const slug = await ensureUniqueSlug(client, slugBase, input.placeId)

  const { error } = await client
    .from('places')
    .update({
      slug,
      name: normalized.normalizedName,
      headline: normalized.normalizedHeadline,
      short_description: normalized.normalizedShortDescription,
      long_description: normalized.normalizedLongDescription,
      kasguide_badge: normalized.normalizedKasguideBadge,
      category_primary: normalized.normalizedCategory,
      address: normalized.normalizedAddress,
      phone: normalized.normalizedPhone,
      website: normalized.normalizedWebsite,
      status: normalizeStatus(input.draft.status),
      verification_status: input.draft.verificationStatus,
      images: buildImages(normalized.normalizedName, normalized.normalizedImages),
      review_notes: 'Mevcut mekan admin panelinden guncellendi.',
      raw_snapshot: {
        ...((existing.raw_snapshot as Record<string, unknown> | null) ?? {}),
        last_admin_save_at: new Date().toISOString(),
      },
    })
    .eq('id', input.placeId)

  if (error) {
    throw new Error('Mevcut mekan kaydi guncellenemedi.')
  }
}
