import 'server-only'

import { randomUUID } from 'node:crypto'

import { getPlaceCategoryLabel, PLACE_CATEGORY_OPTIONS, suggestCategoryFromRaw } from '@/lib/place-taxonomy'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

import {
  normalizeText,
  normalizePhone,
  normalizeWebsite,
  uniqueImageUrls,
  slugifyText,
} from './place-review-utils'

export type RawPlaceSaveAction = 'save_draft' | 'publish' | 'reject'

export type PlaceEditorDraft = {
  placeId: string | null
  slug: string | null
  name: string
  headline: string
  shortDescription: string
  longDescription: string
  categoryPrimary: string
  address: string
  phone: string
  website: string
  imageUrls: string[]
  status: 'draft' | 'review' | 'admin' | 'published' | 'archived'
  verificationStatus: 'pending' | 'reviewed' | 'verified' | 'rejected'
}

export type RecentRawPlaceItem = {
  id: string
  sourceName: string
  sourceId: string
  nameRaw: string | null
  lat: number | null
  lng: number | null
  addressRaw: string | null
  phoneRaw: string | null
  websiteRaw: string | null
  categoryRaw: string | null
  processingStatus: string
  importedAt: string
  gridKey: string | null
  cellId: string | null
  googleMapsUri: string | null
  draft: PlaceEditorDraft
}

export type ExistingPlaceItem = {
  id: string
  updatedAt: string
  draft: PlaceEditorDraft
}

type RecentRawPlaceRow = {
  id: string
  source_name: string
  source_id: string
  name_raw: string | null
  lat: number | null
  lng: number | null
  address_raw: string | null
  phone_raw: string | null
  website_raw: string | null
  category_raw: string | null
  processing_status: string
  imported_at: string
  raw_payload: {
    google?: {
      gridKey?: string
      cellId?: string
      place?: {
        googleMapsUri?: string
      }
    }
  } | null
}

type PlaceSourceRow = {
  raw_place_id: string | null
  place_id: string
}

type PlaceRow = {
  id: string
  slug: string
  name: string
  category_primary: string
  address: string | null
  phone: string | null
  website: string | null
  lat?: number | null
  lng?: number | null
  opening_hours?: string | null
  status: 'draft' | 'review' | 'admin' | 'published' | 'archived'
  verification_status: 'pending' | 'reviewed' | 'verified' | 'rejected'
  updated_at?: string
}

type PlaceContentRow = {
  place_id: string
  headline: string | null
  short_text: string | null
  long_text: string | null
}

type PlaceImageRow = {
  place_id: string
  public_url: string | null
  storage_path: string
  sort_order: number
}

export async function fetchExistingPlaces(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  limit: number,
): Promise<ExistingPlaceItem[]> {
  const { data: placeData, error: placeError } = await client
    .from('places')
    .select('id, slug, name, category_primary, address, phone, website, status, verification_status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (placeError) {
    throw new Error('Mevcut mekan kayıtları okunamadı.')
  }

  const places = (placeData ?? []) as PlaceRow[]
  const placeIds = places.map((place) => place.id)

  if (placeIds.length === 0) {
    return []
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

export async function persistExistingPlace(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  input: {
    placeId: string
    draft: PlaceEditorDraft
  },
): Promise<void> {
  const normalizedName = normalizeText(input.draft.name)
  const normalizedHeadline = normalizeText(input.draft.headline)
  const normalizedShortDescription = normalizeText(input.draft.shortDescription)
  const normalizedLongDescription = normalizeText(input.draft.longDescription)
  const normalizedCategory = normalizeText(input.draft.categoryPrimary)
  const normalizedAddress = normalizeText(input.draft.address)
  const normalizedPhone = normalizePhone(input.draft.phone)
  const normalizedWebsite = normalizeWebsite(input.draft.website)
  const normalizedImages = uniqueImageUrls(input.draft.imageUrls)

  if (!normalizedName) {
    throw new Error('Mekan adı zorunlu.')
  }

  if (!normalizedCategory) {
    throw new Error('Kategori seçilmesi zorunlu.')
  }

  if (!PLACE_CATEGORY_OPTIONS.some((option) => option.id === normalizedCategory)) {
    throw new Error('Geçersiz kategori seçimi.')
  }

  if (normalizedImages.length < 1 || normalizedImages.length > 5) {
    throw new Error('Her mekan için en az 1, en fazla 5 foto gerekli.')
  }

  const slugBase = slugifyText(input.draft.slug || normalizedName) || `place-${input.placeId.slice(0, 8)}`
  const slug = await ensureUniqueSlug(client, slugBase, input.placeId)

  const { error: placeError } = await client
    .from('places')
    .update({
      slug,
      name: normalizedName,
      category_primary: normalizedCategory,
      address: normalizedAddress,
      phone: normalizedPhone,
      website: normalizedWebsite,
      status: input.draft.status,
      verification_status: input.draft.verificationStatus,
    })
    .eq('id', input.placeId)

  if (placeError) {
    throw new Error('Mevcut mekan kaydı güncellenemedi.')
  }

  const { error: contentError } = await client.from('place_content').upsert(
    {
      place_id: input.placeId,
      headline: normalizedHeadline || normalizedName,
      short_text: normalizedShortDescription,
      long_text: normalizedLongDescription,
      tone_type: 'guide',
      last_generated_at: null,
    },
    { onConflict: 'place_id' },
  )

  if (contentError) {
    throw new Error('Mevcut mekan içeriği güncellenemedi.')
  }

  const { error: imageDeleteError } = await client.from('place_images').delete().eq('place_id', input.placeId)

  if (imageDeleteError) {
    throw new Error('Mevcut mekan görselleri temizlenemedi.')
  }

  const { error: imageInsertError } = await client.from('place_images').insert(
    normalizedImages.map((url, index) => ({
      place_id: input.placeId,
      storage_path: url,
      public_url: url,
      alt_text: `${normalizedName} fotoğraf ${index + 1}`,
      source_name: 'admin_manual',
      is_cover: index === 0,
      sort_order: index,
    })),
  )

  if (imageInsertError) {
    throw new Error('Mevcut mekan görselleri güncellenemedi.')
  }
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

export async function updateRawPlaceStatus(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  rawPlaceId: string,
  status: 'review' | 'rejected' | 'normalized',
): Promise<void> {
  const { error } = await client
    .from('raw_places')
    .update({ processing_status: status })
    .eq('id', rawPlaceId)

  if (error) {
    throw new Error('Ham kayıt durumu güncellenemedi.')
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
  const { data: rawPlace, error: rawPlaceError } = await client
    .from('raw_places')
    .select('id, source_name, source_id, name_raw, lat, lng, address_raw, phone_raw, website_raw, category_raw')
    .eq('id', input.rawPlaceId)
    .single()

  if (rawPlaceError || !rawPlace) {
    throw new Error('Ham mekan kaydi bulunamadi.')
  }

  const normalizedName = normalizeText(input.draft.name)
  const normalizedHeadline = normalizeText(input.draft.headline)
  const normalizedShortDescription = normalizeText(input.draft.shortDescription)
  const normalizedLongDescription = normalizeText(input.draft.longDescription)
  const normalizedCategory = normalizeText(input.draft.categoryPrimary)
  const normalizedAddress = normalizeText(input.draft.address)
  const normalizedPhone = normalizePhone(input.draft.phone)
  const normalizedWebsite = normalizeWebsite(input.draft.website)
  const normalizedImages = uniqueImageUrls(input.draft.imageUrls)

  if (!normalizedName) {
    throw new Error('Mekan adi zorunlu.')
  }

  if (!normalizedCategory) {
    throw new Error('Kategori seçilmesi zorunlu.')
  }

  if (!PLACE_CATEGORY_OPTIONS.some((option) => option.id === normalizedCategory)) {
    throw new Error('Geçersiz kategori seçimi.')
  }

  if (normalizedImages.length < 1 || normalizedImages.length > 5) {
    throw new Error('Her mekan için en az 1, en fazla 5 foto gerekli.')
  }

  const existingPlaceSource = await findPlaceSourceForRawPlace(client, input.rawPlaceId)
  const placeId = input.draft.placeId ?? existingPlaceSource?.place_id ?? randomUUID()
  const slugBase = slugifyText(input.draft.slug || normalizedName) || `place-${placeId.slice(0, 8)}`
  const slug = await ensureUniqueSlug(client, slugBase, placeId)
  const placeStatus = input.publish ? 'published' : 'admin'
  const verificationStatus = input.publish ? 'verified' : 'reviewed'

  const { error: placeError } = await client.from('places').upsert(
    {
      id: placeId,
      slug,
      name: normalizedName,
      category_primary: normalizedCategory,
      category_secondary: null,
      address: normalizedAddress,
      lat: rawPlace.lat ?? null,
      lng: rawPlace.lng ?? null,
      phone: normalizedPhone,
      website: normalizedWebsite,
      opening_hours: null,
      status: placeStatus,
      verification_status: verificationStatus,
    },
    { onConflict: 'id' },
  )

  if (placeError) {
    throw new Error('Mekan kaydi kaydedilemedi.')
  }

  const { error: contentError } = await client.from('place_content').upsert(
    {
      place_id: placeId,
      headline: normalizedHeadline || normalizedName,
      short_text: normalizedShortDescription,
      long_text: normalizedLongDescription,
      tone_type: 'guide',
      last_generated_at: null,
    },
    { onConflict: 'place_id' },
  )

  if (contentError) {
    throw new Error('Mekan icerigi kaydedilemedi.')
  }

  const { error: imageDeleteError } = await client.from('place_images').delete().eq('place_id', placeId)

  if (imageDeleteError) {
    throw new Error('Eski mekan gorselleri temizlenemedi.')
  }

  const { error: imageInsertError } = await client.from('place_images').insert(
    normalizedImages.map((url, index) => ({
      place_id: placeId,
      storage_path: url,
      public_url: url,
      alt_text: `${normalizedName} fotoğraf ${index + 1}`,
      source_name: 'admin_manual',
      is_cover: index === 0,
      sort_order: index,
    })),
  )

  if (imageInsertError) {
    throw new Error('Mekan gorselleri kaydedilemedi.')
  }

  const { error: sourceError } = await client.from('place_sources').upsert(
    {
      place_id: placeId,
      raw_place_id: rawPlace.id,
      source_name: rawPlace.source_name,
      source_id: rawPlace.source_id,
      source_url: null,
      is_primary: true,
    },
    { onConflict: 'source_name,source_id' },
  )

  if (sourceError) {
    throw new Error('Kaynak iliskisi kaydedilemedi.')
  }

  const { error: rawStatusError } = await client
    .from('raw_places')
    .update({ processing_status: input.publish ? 'normalized' : 'review' })
    .eq('id', rawPlace.id)

  if (rawStatusError) {
    throw new Error('Ham mekan durumu guncellenemedi.')
  }

  const { error: reviewUpdateError } = await client
    .from('review_queue')
    .update({
      candidate_place_id: placeId,
      status: input.publish ? 'approved' : 'in_review',
      notes: input.publish
        ? 'Admin panelinden onaylanıp yayına alındı.'
        : 'Admin panelinde düzenleniyor.',
    })
    .eq('raw_place_id', rawPlace.id)
    .in('status', ['pending', 'in_review', 'approved'])

  if (reviewUpdateError) {
    throw new Error('Review kuyrugu guncellenemedi.')
  }
}

export async function rejectRawPlace(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  rawPlaceId: string,
): Promise<void> {
  await updateRawPlaceStatus(client, rawPlaceId, 'rejected')

  const { error } = await client
    .from('review_queue')
    .update({ status: 'rejected', notes: 'Admin panelinden reddedildi.' })
    .eq('raw_place_id', rawPlaceId)
    .in('status', ['pending', 'in_review', 'approved'])

  if (error) {
    throw new Error('Review kaydi reddedilemedi.')
  }
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
    const [placesResult, contentResult, imagesResult] = await Promise.all([
      client
        .from('places')
        .select('id, slug, name, category_primary, address, phone, website, status, verification_status')
        .in('id', placeIds),
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

    if (placesResult.error) {
      throw new Error('Mekan kayıtları okunamadı.')
    }

    if (contentResult.error) {
      throw new Error('Mekan icerikleri okunamadi.')
    }

    if (imagesResult.error) {
      throw new Error('Mekan gorselleri okunamadi.')
    }

    for (const row of (placesResult.data ?? []) as PlaceRow[]) {
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

export function mapRecentRawPlaceRow(
  row: RecentRawPlaceRow,
  draft: PlaceEditorDraft | null,
): RecentRawPlaceItem {
  const googleMeta = row.raw_payload?.google

  return {
    id: row.id,
    sourceName: row.source_name,
    sourceId: row.source_id,
    nameRaw: row.name_raw,
    lat: row.lat,
    lng: row.lng,
    addressRaw: row.address_raw,
    phoneRaw: row.phone_raw,
    websiteRaw: row.website_raw,
    categoryRaw: row.category_raw,
    processingStatus: row.processing_status,
    importedAt: row.imported_at,
    gridKey: typeof googleMeta?.gridKey === 'string' ? googleMeta.gridKey : null,
    cellId: typeof googleMeta?.cellId === 'string' ? googleMeta.cellId : null,
    googleMapsUri:
      typeof googleMeta?.place?.googleMapsUri === 'string' ? googleMeta.place.googleMapsUri : null,
    draft: draft ?? buildDraftFromRaw(row, null, null, []),
  }
}

function buildDraftFromRaw(
  rawRow: RecentRawPlaceRow,
  place: PlaceRow | null,
  content: PlaceContentRow | null,
  imageUrls: string[],
): PlaceEditorDraft {
  const fallbackName = normalizeText(rawRow.name_raw) || 'Yeni mekan'
  const categoryPrimary = place?.category_primary ?? suggestCategoryFromRaw(rawRow.category_raw)
  const categoryLabel = getPlaceCategoryLabel(categoryPrimary)

  return {
    placeId: place?.id ?? null,
    slug: place?.slug ?? slugifyText(fallbackName),
    name: place?.name ?? fallbackName,
    headline: normalizeText(content?.headline) ?? fallbackName,
    shortDescription:
      normalizeText(content?.short_text) ??
      `${fallbackName}, Kaş'ta ${categoryLabel.toLowerCase()} olarak listelenen bir mekan.`,
    longDescription: normalizeText(content?.long_text) ?? '',
    categoryPrimary,
    address: normalizeText(place?.address) ?? normalizeText(rawRow.address_raw) ?? '',
    phone: normalizeText(place?.phone) ?? normalizeText(rawRow.phone_raw) ?? '',
    website: normalizeText(place?.website) ?? normalizeText(rawRow.website_raw) ?? '',
    imageUrls: imageUrls.length > 0 ? imageUrls.slice(0, 5) : [''],
    status: place?.status ?? 'admin',
    verificationStatus: place?.verification_status ?? 'pending',
  }
}

function buildDraftFromPlace(
  place: PlaceRow,
  content: PlaceContentRow | null,
  imageUrls: string[],
): PlaceEditorDraft {
  const categoryPrimary = place.category_primary || 'gezi'
  const fallbackName = normalizeText(place.name) || 'Mevcut mekan'
  const categoryLabel = getPlaceCategoryLabel(categoryPrimary)

  return {
    placeId: place.id,
    slug: place.slug ?? slugifyText(fallbackName),
    name: fallbackName,
    headline: normalizeText(content?.headline) ?? fallbackName,
    shortDescription:
      normalizeText(content?.short_text) ??
      `${fallbackName}, Kaş'ta ${categoryLabel.toLowerCase()} olarak listelenen bir mekan.`,
    longDescription: normalizeText(content?.long_text) ?? '',
    categoryPrimary,
    address: normalizeText(place.address) ?? '',
    phone: normalizeText(place.phone) ?? '',
    website: normalizeText(place.website) ?? '',
    imageUrls: imageUrls.length > 0 ? imageUrls.slice(0, 5) : [''],
    status: place.status ?? 'admin',
    verificationStatus: place.verification_status ?? 'pending',
  }
}

async function findPlaceSourceForRawPlace(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  rawPlaceId: string,
): Promise<PlaceSourceRow | null> {
  const { data, error } = await client
    .from('place_sources')
    .select('raw_place_id, place_id')
    .eq('raw_place_id', rawPlaceId)
    .maybeSingle()

  if (error) {
    throw new Error('Mekan kaynağı okunamadı.')
  }

  return data as PlaceSourceRow | null
}

async function ensureUniqueSlug(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  baseSlug: string,
  currentPlaceId: string,
): Promise<string> {
  let slug = baseSlug
  let suffix = 1

  while (true) {
    const { data, error } = await client
      .from('places')
      .select('id, slug')
      .eq('slug', slug)
      .maybeSingle()

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
